(function () {
  'use strict';
  if (window.__WA_EXPORT_COLLECTOR__) return;

  const S = () => window.__WA_EXPORT_STORE__;

  const SKIP_TYPES = {
    e2e_notification: 1,
    notification_template: 1,
    notification: 1,
    protocol: 1,
    ciphertext: 1,
  };

  const TYPE_PREVIEW = {
    image: '[Photo]',
    video: '[Video]',
    audio: '[Audio]',
    ptt: '[Voice note]',
    document: '[Document]',
    sticker: '[Sticker]',
    location: '[Location]',
    vcard: '[Contact]',
    multi_vcard: '[Contacts]',
    poll_creation: '[Poll]',
    call_log: '[Call]',
    gp2: '[Group event]',
    revoked: '[Deleted message]',
  };

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  function msgId(m) {
    try {
      return (m.id && (m.id._serialized || m.id.toString())) || String(m.t || Math.random());
    } catch (_) {
      return String(Math.random());
    }
  }

  function tOf(m) {
    return (m && (m.t || m.timestamp)) || 0;
  }

  function looksLikeBase64Media(s) {
    if (!s || typeof s !== 'string') return false;
    const t = s.replace(/\s+/g, '');
    if (t.length < 64) return false;
    if (/^\/9j\//.test(t)) return true; // jpeg
    if (/^iVBOR/.test(t)) return true; // png
    if (/^UklGR/.test(t)) return true; // webp
    if (/^R0lGOD/.test(t)) return true; // gif
    if (/^Qk/.test(t) && t.length > 200) return true; // bmp
    // long mostly-base64 blob (WA often stores thumbs in body)
    if (t.length > 400 && /^[A-Za-z0-9+/=]+$/.test(t.slice(0, 120))) return true;
    return false;
  }

  function readText(m) {
    try {
      const type = (m && m.type) || 'chat';
      const caption = ((m && m.caption) || '').toString();
      const body = ((m && m.body) || '').toString();
      // Media messages: caption only — body is often a JPEG/WebP thumbnail as base64
      if (/^(image|sticker|video|audio|ptt|document)$/.test(type)) {
        return caption || (looksLikeBase64Media(body) ? '' : body);
      }
      if (looksLikeBase64Media(body)) return caption || '';
      return body || caption || '';
    } catch (_) {
      return '';
    }
  }

  function isFromMeId(idStr) {
    return typeof idStr === 'string' && idStr.indexOf('true_') === 0;
  }

  function mentionWidList(m) {
    const out = [];
    const seen = {};
    function add(v) {
      if (!v) return;
      let s = '';
      try {
        s = v._serialized || (typeof v.toString === 'function' ? v.toString() : String(v));
      } catch (_) {
        s = String(v);
      }
      if (!s || seen[s]) return;
      seen[s] = 1;
      out.push(s);
    }
    try {
      const lists = [
        m.mentionedJidList,
        m.mentionedJids,
        m.mentionedIds,
        m._data && m._data.mentionedJidList,
        m.msgContextInfo && m.msgContextInfo.mentionedJid,
      ];
      for (let i = 0; i < lists.length; i++) {
        const list = lists[i];
        if (!list) continue;
        if (typeof list.forEach === 'function') list.forEach(add);
        else if (list.length != null) for (let j = 0; j < list.length; j++) add(list[j]);
      }
    } catch (_) {}
    return out;
  }

  function digitsOfWid(wid) {
    return String(wid || '')
      .replace(/@.*/, '')
      .replace(/[^\d]/g, '');
  }

  /**
   * Remappable contact markers for the renderer:
   *  ⟦@wid∷Name⟧  — mention (shows as @Name)
   *  ⟦$wid∷Name⟧  — plain name (system actor, etc.)
   */
  function contactMarker(wid, name, asMention) {
    const id = String(wid || '').replace(/[⟧∷]/g, '');
    const n = String(name || '').replace(/[⟧]/g, '');
    if (!id) return n || 'Unknown';
    return '⟦' + (asMention ? '@' : '$') + id + '∷' + n + '⟧';
  }

  function actorLabel(m, chatRaw) {
    if (S().isMeMsg(m)) return 'You';
    const id =
      (m.author && (m.author._serialized || m.author.toString())) ||
      (m.participant && (m.participant._serialized || m.participant.toString())) ||
      (m.from && (m.from._serialized || m.from.toString())) ||
      '';
    const name = S().senderName(m, chatRaw);
    return contactMarker(id, name, false);
  }

  /**
   * Replace @1754882… LIDs with @Display Name markers for the renderer.
   * Markers: ⟦@wid∷Display Name⟧ so names stay remappable.
   */
  function applyMentions(text, m, chatRaw) {
    let out = text || '';
    if (!out) return out;

    const wids = mentionWidList(m);
    const digitTo = {};

    for (let i = 0; i < wids.length; i++) {
      const wid = wids[i];
      const dig = digitsOfWid(wid);
      if (!dig) continue;
      const name = S().resolveContactName(wid, chatRaw) || S().nameFromWid(wid);
      if (name && !/^\d+$/.test(name)) digitTo[dig] = { wid: String(wid), name: name };
    }

    out = out.replace(/@(\d{6,})\b/g, function (full, dig) {
      let entry = digitTo[dig];
      if (!entry) {
        const wid =
          (S().resolveContactName(dig + '@lid', chatRaw) && dig + '@lid') ||
          dig + '@lid';
        const name =
          S().resolveContactName(dig + '@lid', chatRaw) ||
          S().resolveContactName(dig + '@c.us', chatRaw) ||
          S().nameFromWid(dig + '@lid') ||
          S().nameFromWid(dig + '@c.us');
        if (name && !/^\d+$/.test(name)) entry = { wid: wid, name: name };
      }
      if (entry) return contactMarker(entry.wid, entry.name, true);
      return full;
    });

    out = out.replace(/(^|[\s])@all\b/gi, function (m0, pre) {
      return pre + '⟦@all⟧';
    });

    return out;
  }

  function formatGp2Text(m, chatRaw) {
    const sub = (m.subtype || (m._data && m._data.subtype) || '').toString();
    const body = ((m.body || '') + '').toString();
    const actor = actorLabel(m, chatRaw);

    if (sub === 'hidden_group' || sub === 'hidden') {
      return actor + ' set the group visibility to hidden';
    }
    if (sub === 'unhidden_group' || sub === 'unhidden') {
      return actor + ' set the group visibility to visible';
    }

    const map = {
      subject: actor + ' changed the group name to "' + (body || '…') + '"',
      create: actor + ' created this group',
      add: actor + ' added someone',
      remove: actor + ' removed someone',
      leave: actor + ' left',
      promote: actor + ' made someone an admin',
      demote: actor + ' removed admin rights',
      invite: actor + ' joined via invite',
      description: actor + ' changed the group description',
      picture: actor + " changed this group's icon",
      revoke_invite: actor + ' revoked the invite link',
      announce: actor + ' changed group settings',
      restrict: actor + ' changed group settings',
      locked: actor + ' changed group settings',
      unlocked: actor + ' changed group settings',
    };

    if (map[sub]) return map[sub];
    if (body && !looksLikeBase64Media(body)) {
      if (/hidden/i.test(body) || /hidden/i.test(sub)) {
        return actor + ' set the group visibility to hidden';
      }
      return actor + ' updated the group' + (sub ? ' (' + sub + ')' : '');
    }
    if (sub) return actor + ' updated the group (' + sub + ')';
    return actor + ' updated the group';
  }

  function formatSystemText(m, chatRaw) {
    const type = m.type || '';
    if (type === 'gp2') return formatGp2Text(m, chatRaw);
    if (type === 'album') return '[Album]';
    if (type === 'groups_v4_invite') return '[Group invite]';
    if (TYPE_PREVIEW[type]) return TYPE_PREVIEW[type];
    return readText(m);
  }

  function toArr(r) {
    const a = [];
    try {
      if (!r) return a;
      if (typeof r.forEach === 'function') {
        r.forEach((m) => a.push(m));
        return a;
      }
      if (r.length != null) {
        for (let i = 0; i < r.length; i++) a.push(r[i]);
      }
    } catch (_) {}
    return a;
  }

  function findScroller(main) {
    if (!main) return null;
    const cands = main.querySelectorAll('[data-id], [role="row"], [role="application"]');
    for (let i = 0; i < cands.length; i++) {
      let node = cands[i];
      while (node && node !== main.parentElement && node !== document.body) {
        try {
          const st = getComputedStyle(node);
          if (node.scrollHeight - node.clientHeight > 40 && /(auto|scroll)/.test(st.overflowY)) {
            return node;
          }
        } catch (_) {}
        node = node.parentElement;
      }
    }
    // fallback: largest scrollable in #main
    try {
      const all = main.querySelectorAll('*');
      let best = null;
      let bestH = 0;
      for (let i = 0; i < all.length; i++) {
        const el = all[i];
        const st = getComputedStyle(el);
        if (/(auto|scroll)/.test(st.overflowY) && el.scrollHeight - el.clientHeight > bestH) {
          bestH = el.scrollHeight - el.clientHeight;
          best = el;
        }
      }
      return best;
    } catch (_) {
      return null;
    }
  }

  async function loadHistory(chat, options) {
    const opts = options || {};
    const limit = opts.limit || 0; // 0 = all available
    const cancelled = opts.cancelled || (() => false);
    const onProgress = opts.onProgress || (() => {});
    const scrollTries = opts.scrollTries || 40;
    const scrollWait = opts.scrollWait || 650;
    const scrollNoGrow = opts.scrollNoGrow || 4;

    await S().openChat(chat.raw || chat);
    await sleep(500);

    const raw = chat.raw || chat;
    const main = document.querySelector('#main');
    let sc = findScroller(main);
    let last = S().countMsgs(raw);
    let noGrow = 0;

    onProgress({ phase: 'history', loaded: last, limit });

    for (let s = 0; s < scrollTries; s++) {
      if (cancelled()) break;
      if (limit > 0 && last >= limit) break;
      if (!sc) sc = findScroller(main);
      if (!sc) break;

      try {
        sc.scrollTop = 0;
        sc.dispatchEvent(new WheelEvent('wheel', { deltaY: -2000, bubbles: true }));
        sc.dispatchEvent(new Event('scroll', { bubbles: true }));
      } catch (_) {}

      // Try Store history load if available
      try {
        if (typeof raw.loadEarlierMsgs === 'function') {
          await raw.loadEarlierMsgs();
        } else if (raw.msgs && typeof raw.msgs.loadEarlierMsgs === 'function') {
          await raw.msgs.loadEarlierMsgs();
        }
      } catch (_) {}

      await sleep(scrollWait);
      if (!document.contains(sc)) sc = findScroller(main);

      const c = S().countMsgs(raw);
      if (c <= last) noGrow++;
      else noGrow = 0;
      last = c;
      onProgress({ phase: 'history', loaded: last, limit });
      if (noGrow >= scrollNoGrow) break;
    }

    return last;
  }

  function collectRawMessages(chat) {
    const raw = chat.raw || chat;
    const seen = {};
    const out = [];

    function add(list) {
      for (let i = 0; i < list.length; i++) {
        const m = list[i];
        const k = msgId(m);
        if (!seen[k]) {
          seen[k] = 1;
          out.push(m);
        }
      }
    }

    try {
      let r = raw.getAllMsgs && raw.getAllMsgs();
      if (r && typeof r.then === 'function') {
        // sync path only here; async handled by caller
      } else {
        add(toArr(r));
      }
    } catch (_) {}

    try {
      const mm = [];
      raw.msgs.forEach((m) => mm.push(m));
      add(mm);
    } catch (_) {}

    out.sort((a, b) => tOf(a) - tOf(b));
    return out;
  }

  async function collectRawMessagesAsync(chat) {
    const raw = chat.raw || chat;
    const seen = {};
    const out = [];

    function add(list) {
      for (let i = 0; i < list.length; i++) {
        const m = list[i];
        const k = msgId(m);
        if (!seen[k]) {
          seen[k] = 1;
          out.push(m);
        }
      }
    }

    try {
      let r = raw.getAllMsgs && raw.getAllMsgs();
      if (r && typeof r.then === 'function') r = await r;
      add(toArr(r));
    } catch (_) {}

    try {
      const mm = [];
      raw.msgs.forEach((m) => mm.push(m));
      add(mm);
    } catch (_) {}

    out.sort((a, b) => tOf(a) - tOf(b));
    return out;
  }

  function previewForType(type, text) {
    if (text && String(text).trim() && !looksLikeBase64Media(text)) {
      const t = String(text).trim();
      return t.length > 80 ? t.slice(0, 77) + '…' : t;
    }
    return TYPE_PREVIEW[type] || '[' + (type || 'message') + ']';
  }

  function normalizeType(type) {
    if (!type) return 'unknown';
    if (type === 'chat') return 'chat';
    return type;
  }

  function resolveQuoted(msg, byId, chatName, isGroup) {
    let q = null;
    try {
      q = msg.quotedMsg || null;
      if (!q && msg.quotedMsgObj) {
        q = typeof msg.quotedMsgObj === 'function' ? msg.quotedMsgObj() : msg.quotedMsgObj;
      }
    } catch (_) {}

    let quotedId = null;
    try {
      if (q && q.id) quotedId = q.id._serialized || q.id.toString();
      else if (msg.quotedMsgId) {
        quotedId =
          msg.quotedMsgId._serialized ||
          (typeof msg.quotedMsgId.toString === 'function'
            ? msg.quotedMsgId.toString()
            : String(msg.quotedMsgId));
      } else if (msg.quotedStanzaID) {
        const stanza = String(msg.quotedStanzaID);
        const keys = Object.keys(byId);
        for (let i = 0; i < keys.length; i++) {
          if (keys[i].indexOf(stanza) >= 0) {
            quotedId = keys[i];
            break;
          }
        }
      }
    } catch (_) {}

    // Prefer already-normalized parent (correct names for LID / fromMe)
    if (quotedId && byId[quotedId]) {
      const parent = byId[quotedId];
      return {
        id: quotedId,
        senderName: parent.senderName,
        senderId: parent.senderId || '',
        type: parent.type,
        previewText: previewForType(parent.type, parent.text),
        previewMediaPath: parent.media && parent.media.path ? parent.media.path : null,
      };
    }

    if (!q && !quotedId) return null;

    if (q) {
      const qType = normalizeType(q.type || 'chat');
      const qText = readText(q);
      const qId = quotedId || msgId(q);
      let qSender = 'Unknown';
      let qSenderId = '';
      try {
        if (S().isMeMsg(q) || isFromMeId(qId)) {
          qSender = 'You';
          qSenderId = (S().getMeWids()[0] || '') + '';
        } else if (!isGroup && chatName) {
          qSender = chatName;
        } else {
          qSender = S().senderName(q);
          if (!qSender || qSender === 'Unknown' || /^[0-9]+$/.test(qSender)) {
            qSender = chatName || qSender || 'Unknown';
          }
        }
        if (!qSenderId) {
          qSenderId =
            (q.author && (q.author._serialized || q.author.toString())) ||
            (q.from && (q.from._serialized || q.from.toString())) ||
            '';
        }
      } catch (_) {
        qSender = isFromMeId(qId) ? 'You' : chatName || 'Unknown';
      }
      return {
        id: qId,
        senderName: qSender,
        senderId: qSenderId,
        type: qType,
        previewText: previewForType(qType, qText),
        previewMediaPath: null,
      };
    }

    return {
      id: quotedId,
      senderName: isFromMeId(quotedId) ? 'You' : chatName || '',
      senderId: '',
      type: 'chat',
      previewText: '[Original message]',
      previewMediaPath: null,
    };
  }

  function normalizeMessage(m, isGroup, chatName, chatRaw) {
    const type = normalizeType(m.type || 'chat');
    if (SKIP_TYPES[type]) return null;

    const fromMe = S().isMeMsg(m);
    const isSystem = /^(gp2|notification|call_log|groups_v4_invite|album)$/.test(type);
    let text = isSystem ? formatSystemText(m, chatRaw) : readText(m);
    if (!isSystem) text = applyMentions(text, m, chatRaw);

    const id = msgId(m);
    const ts = tOf(m);

    let sender = fromMe ? 'You' : S().senderName(m, chatRaw);
    if (!fromMe) {
      if (!isGroup && chatName) sender = chatName;
      else if (!sender || sender === 'Unknown' || /^\d+$/.test(sender)) {
        sender = (isGroup ? S().resolveContactName(
          (m.author && (m.author._serialized || m.author.toString())) || '',
          chatRaw
        ) : null) || chatName || sender || 'Unknown';
      }
    }

    const isDeleted = type === 'revoked' || !!m.isRevoked;
    const isForwarded = !!(m.isForwarded || m.forwardingScore);

    // Drop truly empty non-system bubbles
    if (
      !isDeleted &&
      !isSystem &&
      !text &&
      !/^(image|sticker|document|ptt|audio|video)$/.test(type)
    ) {
      return null;
    }

    return {
      id,
      ts,
      fromMe,
      senderName: sender,
      senderId: (function () {
        try {
          if (fromMe) {
            const mes = S().getMeWids();
            if (mes && mes[0]) return mes[0];
          }
          return (
            (m.author && (m.author._serialized || m.author.toString())) ||
            (m.participant && (m.participant._serialized || m.participant.toString())) ||
            (m.from && (m.from._serialized || m.from.toString())) ||
            ''
          );
        } catch (_) {
          return '';
        }
      })(),
      type: isDeleted ? 'revoked' : type,
      text: isDeleted ? '' : text,
      replyTo: null,
      media: null,
      isForwarded,
      isDeleted,
      isSystem: isSystem && !isDeleted,
      _needsMedia: /^(image|sticker|document|ptt|audio|video)$/.test(type) && !isDeleted,
      _raw: m,
    };
  }

  async function collectMessages(chatInfo, options) {
    const opts = options || {};
    const limit = opts.limit || 0;
    const cancelled = opts.cancelled || (() => false);
    const onProgress = opts.onProgress || (() => {});

    await loadHistory(chatInfo, {
      limit,
      cancelled,
      onProgress,
      scrollTries: opts.scrollTries,
      scrollWait: opts.scrollWait,
    });

    if (cancelled()) return { messages: [], chat: chatInfo };

    let raws = await collectRawMessagesAsync(chatInfo);
    if (limit > 0 && raws.length > limit) {
      raws = raws.slice(raws.length - limit);
    }

    const isGroup = !!chatInfo.isGroup;
    const chatName = chatInfo.name || '';
    const chatRaw = chatInfo.raw || null;
    const normalized = [];
    const byId = {};

    for (let i = 0; i < raws.length; i++) {
      if (cancelled()) break;
      const n = normalizeMessage(raws[i], isGroup, chatName, chatRaw);
      if (!n) continue;
      normalized.push(n);
      byId[n.id] = n;
      if (i % 50 === 0) {
        onProgress({ phase: 'normalize', done: i + 1, total: raws.length });
      }
    }

    for (let i = 0; i < normalized.length; i++) {
      const n = normalized[i];
      n.replyTo = resolveQuoted(n._raw, byId, chatName, isGroup);
    }

    onProgress({ phase: 'normalize', done: normalized.length, total: normalized.length });

    const participants = collectParticipants(chatInfo, normalized);

    return {
      chat: {
        id: chatInfo.id,
        name: chatInfo.name,
        isGroup: chatInfo.isGroup,
      },
      participants,
      messages: normalized,
    };
  }

  function collectParticipants(chatInfo, messages) {
    const byKey = {};
    const chatRaw = chatInfo.raw || null;

    function keyOf(id) {
      return String(id || '');
    }

    function upsert(id, name, phone) {
      const key = keyOf(id);
      if (!key) return;
      if (S().isMeWid(key)) return; // readers already see "You"
      const dig = digitsOfWid(key);
      const alt = dig ? dig : key;
      const existing = byKey[key] || byKey[alt];
      const entry = existing || {
        id: key,
        defaultName: '',
        phone: '',
      };
      if (name && (!entry.defaultName || entry.defaultName === 'Unknown' || /^\d+$/.test(entry.defaultName))) {
        entry.defaultName = name;
      }
      if (phone && !entry.phone) entry.phone = phone;
      if (!entry.id) entry.id = key;
      byKey[key] = entry;
      if (alt && alt !== key) byKey[alt] = entry;
    }

    try {
      const gm = chatRaw && chatRaw.groupMetadata;
      const ps = gm && gm.participants;
      if (ps && typeof ps.forEach === 'function') {
        ps.forEach((p) => {
          try {
            const pid = p.id && (p.id._serialized || p.id.toString());
            if (!pid) return;
            const name =
              S().resolveContactName(pid, chatRaw) ||
              S().nameFromWid(pid) ||
              (p.contact && (p.contact.name || p.contact.pushname)) ||
              '';
            const phone = S().phoneFromWid(pid) || '';
            upsert(pid, name, phone);
          } catch (_) {}
        });
      }
    } catch (_) {}

    // DM peer
    if (!chatInfo.isGroup && chatInfo.id) {
      upsert(
        chatInfo.id,
        chatInfo.name || S().resolveContactName(chatInfo.id, chatRaw) || '',
        S().phoneFromWid(chatInfo.id) || ''
      );
    }

    for (let i = 0; i < messages.length; i++) {
      const m = messages[i];
      if (!m || m.fromMe) continue;
      if (m.senderId) {
        upsert(m.senderId, m.senderName || '', S().phoneFromWid(m.senderId) || '');
      }
    }

    const list = [];
    const seen = {};
    const keys = Object.keys(byKey);
    for (let i = 0; i < keys.length; i++) {
      const e = byKey[keys[i]];
      if (!e || seen[e.id]) continue;
      seen[e.id] = 1;
      if (!e.defaultName) e.defaultName = S().prettyWid ? S().prettyWid(e.id) : digitsOfWid(e.id) || e.id;
      list.push({
        id: e.id,
        defaultName: e.defaultName,
        phone: e.phone || '',
      });
    }

    list.sort(function (a, b) {
      return String(a.defaultName).localeCompare(String(b.defaultName));
    });
    return list;
  }

  window.__WA_EXPORT_COLLECTOR__ = {
    loadHistory,
    collectMessages,
    previewForType,
    TYPE_PREVIEW,
    msgId,
    tOf,
  };
})();
