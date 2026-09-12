(function () {
  'use strict';
  if (window.__WA_EXPORT_STORE__) return;

  function getRequire() {
    return window.require || (typeof self !== 'undefined' && self.require) || null;
  }

  function tryRequire(name) {
    const req = getRequire();
    if (!req) return null;
    try {
      return req(name);
    } catch (_) {
      return null;
    }
  }

  function getCollections() {
    return tryRequire('WAWebCollections');
  }

  function getCmd() {
    const mod = tryRequire('WAWebCmd');
    return mod && (mod.Cmd || mod.default || mod);
  }

  function widSerialized(w) {
    if (!w) return '';
    try {
      if (typeof w === 'string') return w;
      return w._serialized || (typeof w.toString === 'function' ? w.toString() : String(w));
    } catch (_) {
      return '';
    }
  }

  /** Current account JIDs (phone + LID). gp2 events often have fromMe=false incorrectly. */
  function getMeWids() {
    const out = [];
    const seen = {};
    function add(w) {
      const s = widSerialized(w);
      if (!s || seen[s]) return;
      seen[s] = 1;
      out.push(s);
      const dig = s.replace(/@.*/, '').replace(/[^\d]/g, '');
      if (dig) {
        seen[dig] = 1;
      }
    }

    try {
      const meMod = tryRequire('WAWebUserPrefsMeUser');
      if (meMod) {
        ['getMaybeMeLidUser', 'getMaybeMePnUser', 'getMe', 'getMaybeMeUser'].forEach((fn) => {
          try {
            if (typeof meMod[fn] === 'function') add(meMod[fn]());
          } catch (_) {}
        });
      }
    } catch (_) {}

    try {
      const ConnMod = tryRequire('WAWebConnModel');
      const Conn = ConnMod && (ConnMod.Conn || ConnMod.default || ConnMod);
      if (Conn) {
        add(Conn.me);
        add(Conn.wid);
        add(Conn.lid);
      }
    } catch (_) {}

    try {
      const C = getCollections();
      if (C && C.Conn) {
        add(C.Conn.me);
        add(C.Conn.wid);
      }
    } catch (_) {}

    return out;
  }

  function isMeWid(widStr) {
    if (!widStr) return false;
    const s = String(widStr);
    const dig = s.replace(/@.*/, '').replace(/[^\d]/g, '');
    const mes = getMeWids();
    for (let i = 0; i < mes.length; i++) {
      if (mes[i] === s) return true;
      const md = String(mes[i]).replace(/@.*/, '').replace(/[^\d]/g, '');
      if (dig && md && dig === md) return true;
    }
    return false;
  }

  function isMeMsg(msg) {
    try {
      if (msg && msg.id && msg.id.fromMe) return true;
      const author =
        (msg.author && widSerialized(msg.author)) ||
        (msg.participant && widSerialized(msg.participant)) ||
        (msg.from && widSerialized(msg.from)) ||
        '';
      if (author && isMeWid(author)) return true;

      // Group msg keys often end with _<participantJid>
      const sid = msg.id && (msg.id._serialized || msg.id.toString());
      if (sid) {
        const parts = String(sid).split('_');
        const last = parts[parts.length - 1] || '';
        if (last.indexOf('@') >= 0 && isMeWid(last)) return true;
      }
    } catch (_) {}
    return false;
  }

  function isStoreReady() {
    const c = getCollections();
    return !!(c && c.Chat && typeof c.Chat.forEach === 'function');
  }

  function waitForStore(timeoutMs) {
    const timeout = timeoutMs || 120000;
    const start = Date.now();
    return new Promise((resolve, reject) => {
      function tick() {
        if (isStoreReady()) {
          resolve(true);
          return;
        }
        if (Date.now() - start > timeout) {
          reject(new Error('WhatsApp Store not ready. Make sure you are logged in.'));
          return;
        }
        setTimeout(tick, 400);
      }
      tick();
    });
  }

  function idOf(model) {
    try {
      if (!model || !model.id) return '';
      return model.id._serialized || model.id.toString() || '';
    } catch (_) {
      return '';
    }
  }

  function isRealChat(chat) {
    const id = idOf(chat);
    return (
      (id.endsWith('@c.us') || id.endsWith('@g.us') || id.endsWith('@lid')) &&
      id !== '0@c.us' &&
      id.indexOf('status') < 0
    );
  }

  function isGroupChat(chat) {
    const id = idOf(chat);
    return id.endsWith('@g.us');
  }

  function chatTitle(chat) {
    try {
      return (
        chat.formattedTitle ||
        chat.name ||
        (chat.contact && (chat.contact.name || chat.contact.pushname || chat.contact.verifiedName)) ||
        idOf(chat)
      );
    } catch (_) {
      return idOf(chat) || 'Chat';
    }
  }

  function getActiveChat() {
    const C = getCollections();
    if (!C || !C.Chat) return null;

    let active = null;

    try {
      if (typeof C.Chat.getActive === 'function') active = C.Chat.getActive();
    } catch (_) {}

    if (!active) {
      try {
        const activeMod = tryRequire('WAWebChatCollection');
        const coll = activeMod && (activeMod.ChatCollection || activeMod.default || activeMod);
        if (coll && typeof coll.getActive === 'function') active = coll.getActive();
      } catch (_) {}
    }

    if (!active) {
      try {
        C.Chat.forEach((c) => {
          if (active) return;
          if (c.active || c.__x_active || c.viewCountActive) active = c;
        });
      } catch (_) {}
    }

    // Match open conversation header title
    if (!active) {
      try {
        const titleEl =
          document.querySelector('#main header [data-testid="conversation-info-header-chat-title"]') ||
          document.querySelector('#main header span[title]') ||
          document.querySelector('#main header h1, #main header h2');
        const openTitle = titleEl && (titleEl.getAttribute('title') || titleEl.textContent || '').trim();
        if (openTitle) {
          C.Chat.forEach((c) => {
            if (!isRealChat(c)) return;
            if (chatTitle(c) === openTitle) active = c;
          });
        }
      } catch (_) {}
    }

    if (!active || !isRealChat(active)) return null;

    return {
      raw: active,
      id: idOf(active),
      name: chatTitle(active),
      isGroup: isGroupChat(active),
      approxMsgCount: countMsgs(active),
    };
  }

  function countMsgs(chat) {
    let n = 0;
    try {
      if (chat.msgs && typeof chat.msgs.forEach === 'function') {
        chat.msgs.forEach(() => {
          n++;
        });
      }
    } catch (_) {}
    return n;
  }

  function nameFromWid(widStr) {
    if (!widStr) return '';
    try {
      const C = getCollections();
      const ct = C && C.Contact && C.Contact.get ? C.Contact.get(widStr) : null;
      if (ct) {
        const n =
          ct.name ||
          ct.pushname ||
          ct.formattedName ||
          ct.verifiedName ||
          ct.displayName ||
          '';
        if (n) return n;
      }
    } catch (_) {}
    return '';
  }

  function prettyWid(widStr) {
    try {
      return String(widStr).replace(/@.*/, '') || String(widStr);
    } catch (_) {
      return '';
    }
  }

  /** Best-effort phone digits for a contact (often empty for LID-only peers). */
  function phoneFromWid(widStr) {
    if (!widStr) return '';
    const id = String(widStr);
    try {
      if (id.indexOf('@c.us') >= 0 || id.indexOf('@s.whatsapp.net') >= 0) {
        return id.replace(/@.*/, '').replace(/[^\d]/g, '');
      }
    } catch (_) {}

    try {
      const C = getCollections();
      const ct = C && C.Contact && C.Contact.get ? C.Contact.get(id) : null;
      if (ct) {
        const candidates = [
          ct.phoneNumber,
          ct.userid,
          ct.pnJid,
          ct.id && ct.id.user,
          ct.__x_phoneNumber,
        ];
        for (let i = 0; i < candidates.length; i++) {
          const c = candidates[i];
          if (!c) continue;
          const s = typeof c === 'object' ? widSerialized(c) : String(c);
          const dig = s.replace(/@.*/, '').replace(/[^\d]/g, '');
          if (dig && dig.length >= 7) return dig;
        }
      }
    } catch (_) {}

    try {
      const mapMod =
        tryRequire('WAWebLidPnMapper') ||
        tryRequire('WAWebApiContact') ||
        tryRequire('WAWebContactGetters');
      if (mapMod) {
        const fns = ['lidToPhoneNumber', 'getPhoneNumber', 'getPnLidEntry'];
        for (let i = 0; i < fns.length; i++) {
          try {
            if (typeof mapMod[fns[i]] === 'function') {
              const r = mapMod[fns[i]](id);
              const dig = String(r || '')
                .replace(/@.*/, '')
                .replace(/[^\d]/g, '');
              if (dig && dig.length >= 7) return dig;
            }
          } catch (_) {}
        }
      }
    } catch (_) {}

    return '';
  }

  /** Resolve a JID/LID to a human name (contacts + group participants). */
  function resolveContactName(widStr, chatRaw) {
    if (!widStr) return '';
    const id = String(widStr);
    let name = nameFromWid(id);
    if (name) return name;

    // Try alternate get by user part
    try {
      const C = getCollections();
      const user = id.replace(/@.*/, '');
      if (C && C.Contact && typeof C.Contact.forEach === 'function') {
        C.Contact.forEach((ct) => {
          if (name) return;
          try {
            const cid = ct.id && (ct.id._serialized || ct.id.toString());
            if (!cid) return;
            if (cid === id || String(cid).indexOf(user) === 0) {
              name =
                ct.name ||
                ct.pushname ||
                ct.formattedName ||
                ct.verifiedName ||
                ct.displayName ||
                '';
            }
          } catch (_) {}
        });
      }
    } catch (_) {}
    if (name) return name;

    // Group participants
    try {
      const gm = chatRaw && chatRaw.groupMetadata;
      const ps = gm && gm.participants;
      if (ps && typeof ps.forEach === 'function') {
        ps.forEach((p) => {
          if (name) return;
          try {
            const pid = p.id && (p.id._serialized || p.id.toString());
            if (!pid) return;
            if (pid === id || String(pid).replace(/@.*/, '') === id.replace(/@.*/, '')) {
              name =
                nameFromWid(pid) ||
                (p.contact &&
                  (p.contact.name || p.contact.pushname || p.contact.verifiedName)) ||
                '';
            }
          } catch (_) {}
        });
      }
    } catch (_) {}

    return name || '';
  }

  function senderName(msg, chatRaw) {
    try {
      if (isMeMsg(msg)) return 'You';
      const author =
        (msg.author && (msg.author._serialized || msg.author.toString())) ||
        (msg.from && (msg.from._serialized || msg.from.toString())) ||
        '';
      return resolveContactName(author, chatRaw) || nameFromWid(author) || prettyWid(author) || 'Unknown';
    } catch (_) {
      return 'Unknown';
    }
  }

  async function openChat(chat) {
    const Cmd = getCmd();
    try {
      if (Cmd && typeof Cmd.openChatAt === 'function') {
        await Cmd.openChatAt({ chat });
      }
    } catch (_) {}
    try {
      if (typeof chat.waitForChatLoading === 'function') {
        await chat.waitForChatLoading();
      }
    } catch (_) {}
  }

  window.__WA_EXPORT_STORE__ = {
    getRequire,
    tryRequire,
    getCollections,
    getCmd,
    isStoreReady,
    waitForStore,
    idOf,
    isRealChat,
    isGroupChat,
    chatTitle,
    getActiveChat,
    countMsgs,
    nameFromWid,
    prettyWid,
    phoneFromWid,
    resolveContactName,
    getMeWids,
    isMeWid,
    isMeMsg,
    senderName,
    openChat,
  };
})();
