(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /**
   * WhatsApp-style formatting after HTML escape:
   * *bold*  _italic_  ~strike~  ```code```  `code`
   * Mentions / remappable names use markers ⟦@id∷Name⟧ from the collector.
   */
  function formatWhatsAppText(raw) {
    if (raw == null || raw === '') return '';

    const mentionSlots = [];
    let s = String(raw).replace(/⟦([@$])([\s\S]*?)⟧/g, function (_, kindChar, inner) {
      const idx = mentionSlots.length;
      if (kindChar === '@' && inner === 'all') {
        mentionSlots.push({ kind: 'all' });
      } else {
        const sep = inner.indexOf('∷');
        const withAt = kindChar === '@';
        if (sep >= 0) {
          mentionSlots.push({
            kind: 'contact',
            withAt: withAt,
            id: inner.slice(0, sep),
            name: inner.slice(sep + 1),
          });
        } else {
          // legacy ⟦@Name⟧
          mentionSlots.push({ kind: 'contact', withAt: withAt, id: '', name: inner });
        }
      }
      return '§§M' + idx + '§§';
    });

    s = esc(s);

    s = s.replace(/```([\s\S]*?)```/g, function (_, code) {
      return '<pre class="wa-code-block">' + code + '</pre>';
    });
    s = s.replace(/`([^`\n]+?)`/g, '<code class="wa-code">$1</code>');
    s = s.replace(/\*([^*\n]+?)\*/g, '<strong>$1</strong>');
    s = s.replace(/_([^_\n]+?)_/g, '<em>$1</em>');
    s = s.replace(/~([^~\n]+?)~/g, '<s>$1</s>');

    s = s.replace(
      /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
      '<a class="wa-link" href="mailto:$1">$1</a>'
    );
    s = s.replace(
      /(https?:\/\/[^\s<]+)/g,
      '<a class="wa-link" href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    s = s.replace(/§§M(\d+)§§/g, function (_, i) {
      const slot = mentionSlots[Number(i)];
      if (!slot) return '';
      if (slot.kind === 'all') {
        return '<span class="wa-mention">@all</span>';
      }
      const idAttr = slot.id ? ' data-contact-id="' + esc(slot.id) + '"' : '';
      const nameHtml =
        '<span class="wa-contact-name"' + idAttr + '>' + esc(slot.name) + '</span>';
      if (slot.withAt) {
        return '<span class="wa-mention">' + '<span class="wa-at">@</span>' + nameHtml + '</span>';
      }
      return nameHtml;
    });

    s = s.replace(
      /((?:\p{Extended_Pictographic}|\p{Emoji_Presentation})(?:\uFE0F|\u200D(?:\p{Extended_Pictographic}|\p{Emoji_Presentation}))*)/gu,
      '<span class="wa-emoji">$1</span>'
    );

    return s;
  }

  function bodyHtml(text) {
    return '<div class="body-text">' + formatWhatsAppText(text || '') + '</div>';
  }

  function pad(n) {
    return n < 10 ? '0' + n : '' + n;
  }

  function dayKey(ts) {
    const d = new Date(ts * 1000);
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function dayLabel(ts) {
    const d = new Date(ts * 1000);
    const today = new Date();
    const yday = new Date();
    yday.setDate(today.getDate() - 1);
    const key = dayKey(ts);
    if (key === dayKey(Math.floor(today.getTime() / 1000))) return 'Today';
    if (key === dayKey(Math.floor(yday.getTime() / 1000))) return 'Yesterday';
    return d.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  function timeLabel(ts) {
    const d = new Date(ts * 1000);
    return pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  function safeId(id) {
    return 'm-' + String(id || '').replace(/[^a-zA-Z0-9_-]/g, '_');
  }

  function contactNameSpan(id, name) {
    if (!id || name === 'You') return esc(name || '');
    return (
      '<span class="wa-contact-name" data-contact-id="' +
      esc(id) +
      '">' +
      esc(name || '') +
      '</span>'
    );
  }

  function renderMedia(msg) {
    const media = msg.media;
    const type = msg.type;

    if (type === 'sticker') {
      if (media && media.path && !media.placeholder) {
        return '<img class="sticker" src="' + esc(media.path) + '" alt="sticker">';
      }
      return '<div class="placeholder">[Sticker]</div>';
    }

    if (type === 'image') {
      let html = '';
      if (media && media.path && !media.placeholder) {
        html += '<img class="media-img" src="' + esc(media.path) + '" alt="image">';
      } else {
        html += '<div class="placeholder">' + esc((media && media.label) || '[Photo]') + '</div>';
      }
      if (msg.text) html += bodyHtml(msg.text);
      return html;
    }

    if (type === 'document') {
      const name = (media && media.filename) || 'Document';
      if (media && media.path && !media.placeholder) {
        return (
          '<a class="doc-card" href="' +
          esc(media.path) +
          '" download="' +
          esc(name) +
          '"><div class="icon">DOC</div><div class="name">' +
          esc(name) +
          '</div></a>' +
          (msg.text ? bodyHtml(msg.text) : '')
        );
      }
      return (
        '<div class="placeholder">' +
        esc((media && media.label) || '[Document]') +
        (name ? ': ' + esc(name) : '') +
        '</div>' +
        (msg.text ? bodyHtml(msg.text) : '')
      );
    }

    if (type === 'ptt' || type === 'audio') {
      if (media && media.path && !media.placeholder) {
        return (
          '<div class="audio-wrap"><audio controls preload="metadata" src="' +
          esc(media.path) +
          '"></audio></div>' +
          (msg.text ? bodyHtml(msg.text) : '')
        );
      }
      return (
        '<div class="placeholder">' +
        esc((media && media.label) || (type === 'ptt' ? '[Voice note]' : '[Audio]')) +
        '</div>'
      );
    }

    if (type === 'video') {
      if (media && media.path && !media.placeholder && media.mime && media.mime.indexOf('video') === 0) {
        return (
          '<video class="media-video" controls preload="metadata" src="' +
          esc(media.path) +
          '"></video>' +
          (msg.text ? bodyHtml(msg.text) : '')
        );
      }
      if (media && media.path && !media.placeholder) {
        return (
          '<img class="media-img" src="' +
          esc(media.path) +
          '" alt="video">' +
          '<div class="placeholder">[Video]</div>' +
          (msg.text ? bodyHtml(msg.text) : '')
        );
      }
      return (
        '<div class="placeholder">' +
        esc((media && media.label) || '[Video]') +
        '</div>' +
        (msg.text ? bodyHtml(msg.text) : '')
      );
    }

    return '';
  }

  function renderReply(replyTo) {
    if (!replyTo) return '';
    const href = replyTo.id ? '#' + safeId(replyTo.id) : '#';
    const nameHtml =
      replyTo.senderName === 'You' || !replyTo.senderId
        ? esc(replyTo.senderName || '')
        : contactNameSpan(replyTo.senderId, replyTo.senderName || '');
    return (
      '<a class="reply" href="' +
      href +
      '"><div class="r-name">' +
      nameHtml +
      '</div><div class="r-text">' +
      formatWhatsAppText(replyTo.previewText || '') +
      '</div></a>'
    );
  }

  function renderMessage(msg, isGroup, prevMsg) {
    if (msg.isSystem) {
      return (
        '<div class="system" id="' +
        safeId(msg.id) +
        '"><span>' +
        formatWhatsAppText(msg.text || '[Group update]') +
        '</span></div>'
      );
    }

    const isOut = !!msg.fromMe;
    const isSticker = msg.type === 'sticker';
    const rowClass = 'row ' + (isOut ? 'out' : 'in');
    const bubbleClass = 'bubble' + (isSticker ? ' sticker-wrap' : '');
    const idAttr = ' id="' + safeId(msg.id) + '"';

    const showSender =
      isGroup &&
      !isOut &&
      msg.senderName &&
      (!prevMsg ||
        prevMsg.fromMe ||
        prevMsg.isSystem ||
        prevMsg.senderName !== msg.senderName ||
        prevMsg.senderId !== msg.senderId);

    let inner = '';
    if (showSender) {
      inner +=
        '<div class="sender">' + contactNameSpan(msg.senderId, msg.senderName) + '</div>';
    }
    if (msg.isForwarded) {
      inner += '<div class="fwd">Forwarded</div>';
    }
    inner += renderReply(msg.replyTo);

    if (msg.isDeleted || msg.type === 'revoked') {
      inner += '<div class="deleted">This message was deleted</div>';
    } else if (/^(image|sticker|document|ptt|audio|video)$/.test(msg.type)) {
      inner += renderMedia(msg);
    } else {
      inner += bodyHtml(msg.text || '');
    }

    inner +=
      '<div class="meta-line"><span class="time">' +
      esc(timeLabel(msg.ts)) +
      '</span></div>';

    return (
      '<div class="' +
      rowClass +
      '"' +
      idAttr +
      '><div class="' +
      bubbleClass +
      '">' +
      inner +
      '</div></div>'
    );
  }

  function buildMessagesHtml(data) {
    const messages = data.messages || [];
    const isGroup = !!(data.chat && data.chat.isGroup);
    const parts = [];
    let lastDay = '';
    let prev = null;

    for (let i = 0; i < messages.length; i++) {
      const m = messages[i];
      const dk = dayKey(m.ts || 0);
      if (dk !== lastDay) {
        lastDay = dk;
        parts.push('<div class="day"><span>' + esc(dayLabel(m.ts || 0)) + '</span></div>');
      }
      parts.push(renderMessage(m, isGroup, prev));
      prev = m;
    }
    return parts.join('\n');
  }

  function buildAliasPanelHtml(data) {
    const parts = data.participants || [];
    if (!parts.length) return '';

    const rows = parts
      .map(function (p) {
        const phone = p.phone
          ? esc(p.phone)
          : '<span class="alias-phone-missing">number not in export</span>';
        return (
          '<div class="alias-row" data-contact-id="' +
          esc(p.id) +
          '">' +
          '<div class="alias-meta">' +
          '<div class="alias-default">Exported as <strong class="alias-default-name">' +
          esc(p.defaultName || 'Unknown') +
          '</strong></div>' +
          '<div class="alias-phone">' +
          phone +
          '</div>' +
          '</div>' +
          '<label class="alias-label">Show as' +
          '<input class="alias-input" type="text" data-alias-for="' +
          esc(p.id) +
          '" value="' +
          esc(p.defaultName || '') +
          '" autocomplete="off" spellcheck="false">' +
          '</label>' +
          '</div>'
        );
      })
      .join('\n');

    return (
      '<section class="alias-panel" id="alias-panel">' +
      '<h2>Recognize people</h2>' +
      '<p class="alias-help">Names above are how the person who exported this chat saved contacts. ' +
      'Match a number (when available) and rename for your reading. ' +
      'Changes apply only in this open page — the archive file keeps the original names.</p>' +
      '<div class="alias-list">' +
      rows +
      '</div>' +
      '<div class="alias-actions">' +
      '<button type="button" class="alias-btn primary" id="alias-apply">Apply names</button>' +
      '<button type="button" class="alias-btn" id="alias-reset">Reset to export defaults</button>' +
      '</div>' +
      '<p class="alias-note" id="alias-status" hidden></p>' +
      '</section>'
    );
  }

  function aliasRuntimeScript() {
    return (
      '(function(){\n' +
      '  function applyMap(map){\n' +
      '    var nodes = document.querySelectorAll("[data-contact-id]");\n' +
      '    for (var i = 0; i < nodes.length; i++) {\n' +
      '      var el = nodes[i];\n' +
      '      if (el.classList && el.classList.contains("alias-row")) continue;\n' +
      '      var id = el.getAttribute("data-contact-id");\n' +
      '      if (!id || !map[id]) continue;\n' +
      '      var nameEl = el.classList.contains("wa-contact-name") ? el : el.querySelector(".wa-contact-name");\n' +
      '      if (nameEl) nameEl.textContent = map[id];\n' +
      '      else if (el.classList.contains("wa-mention")) {\n' +
      '        var inner = el.querySelector(".wa-contact-name");\n' +
      '        if (inner) inner.textContent = map[id];\n' +
      '        else el.textContent = "@" + map[id];\n' +
      '      } else {\n' +
      '        el.textContent = map[id];\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  function readInputs(){\n' +
      '    var map = {};\n' +
      '    var inputs = document.querySelectorAll(".alias-input");\n' +
      '    for (var i = 0; i < inputs.length; i++) {\n' +
      '      var inp = inputs[i];\n' +
      '      var id = inp.getAttribute("data-alias-for");\n' +
      '      var v = (inp.value || "").trim();\n' +
      '      if (id && v) map[id] = v;\n' +
      '    }\n' +
      '    return map;\n' +
      '  }\n' +
      '  function defaults(){\n' +
      '    var map = {};\n' +
      '    var rows = document.querySelectorAll(".alias-row");\n' +
      '    for (var i = 0; i < rows.length; i++) {\n' +
      '      var row = rows[i];\n' +
      '      var id = row.getAttribute("data-contact-id");\n' +
      '      var n = row.querySelector(".alias-default-name");\n' +
      '      if (id && n) map[id] = n.textContent;\n' +
      '      var inp = row.querySelector(".alias-input");\n' +
      '      if (inp && n) inp.value = n.textContent;\n' +
      '    }\n' +
      '    return map;\n' +
      '  }\n' +
      '  function setStatus(msg){\n' +
      '    var el = document.getElementById("alias-status");\n' +
      '    if (!el) return;\n' +
      '    el.hidden = !msg;\n' +
      '    el.textContent = msg || "";\n' +
      '  }\n' +
      '  var applyBtn = document.getElementById("alias-apply");\n' +
      '  var resetBtn = document.getElementById("alias-reset");\n' +
      '  if (applyBtn) applyBtn.addEventListener("click", function(){\n' +
      '    applyMap(readInputs());\n' +
      '    setStatus("Names updated for this reading session. Reload the page to restore the archive defaults.");\n' +
      '  });\n' +
      '  if (resetBtn) resetBtn.addEventListener("click", function(){\n' +
      '    applyMap(defaults());\n' +
      '    setStatus("Restored export defaults.");\n' +
      '  });\n' +
      '  document.addEventListener("click", function(e){\n' +
      '    var a = e.target.closest("a.reply");\n' +
      '    if(!a) return;\n' +
      '    var href = a.getAttribute("href");\n' +
      '    if(!href || href.charAt(0) !== "#") return;\n' +
      '    var el = document.getElementById(href.slice(1));\n' +
      '    if(!el) return;\n' +
      '    e.preventDefault();\n' +
      '    el.scrollIntoView({behavior:"smooth", block:"center"});\n' +
      '    el.classList.add("msg-highlight");\n' +
      '    setTimeout(function(){ el.classList.remove("msg-highlight"); }, 1300);\n' +
      '  });\n' +
      '})();\n'
    );
  }

  function buildIndexHtml(data, cssText) {
    const chat = data.chat || {};
    const title = chat.name || 'Chat';
    const badge = chat.isGroup ? 'Group' : 'Chat';
    const count = (data.messages || []).length;
    const exportedAt = data.exportedAt || new Date().toISOString();
    const embedded = JSON.stringify(data).replace(/</g, '\\u003c');

    return (
      '<!DOCTYPE html>\n<html lang="en">\n<head>\n' +
      '<meta charset="utf-8">\n' +
      '<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
      '<title>' +
      esc(title) +
      ' — WhatsApp Export</title>\n' +
      '<link rel="stylesheet" href="styles.css">\n' +
      '</head>\n<body>\n' +
      '<div class="header"><div><h1>' +
      esc(title) +
      '<span class="badge">' +
      esc(badge) +
      '</span></h1></div>' +
      '<div class="meta">' +
      count +
      ' messages</div></div>\n' +
      '<div class="wrap" id="chat-root">\n' +
      buildMessagesHtml(data) +
      '\n' +
      buildAliasPanelHtml(data) +
      '\n</div>\n' +
      '<div class="footer">Exported ' +
      esc(exportedAt) +
      ' · WhatsApp Rich Chat Export · Offline archive</div>\n' +
      '<script type="application/json" id="chat-data">' +
      embedded +
      '</script>\n' +
      '<script>\n' +
      aliasRuntimeScript() +
      '</script>\n' +
      '</body>\n</html>'
    );
  }

  window.WA_EXPORT_RENDERER = {
    buildIndexHtml,
    buildMessagesHtml,
    esc,
    formatWhatsAppText,
  };
  if (typeof globalThis !== 'undefined') globalThis.WA_EXPORT_RENDERER = window.WA_EXPORT_RENDERER;
})();
