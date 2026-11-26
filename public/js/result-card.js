/**
 * 測速結果圖：把結果畫成一張 1080×1080 的圖，手機走系統分享，電腦直接下載。
 * 用法：MSTResultCard.save({ value, unit, title, detail, host })
 */
(function () {
  var SIZE = 1080;
  var INK = '#1a1a1a';
  var GRAY = '#666666';
  var RED = '#ff4757';
  var YELLOW = '#ff9500';
  var BLUE = '#3742fa';

  function fitText(ctx, text, weight, size, family, maxWidth) {
    var px = size;
    ctx.font = weight + ' ' + px + 'px ' + family;
    while (ctx.measureText(text).width > maxWidth && px > 12) {
      px -= 2;
      ctx.font = weight + ' ' + px + 'px ' + family;
    }
  }

  function decorate(ctx) {
    ctx.save();
    ctx.lineWidth = 5;
    ctx.globalAlpha = 0.45;
    ctx.strokeStyle = YELLOW;
    ctx.beginPath();
    ctx.arc(-30, 330, 300, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = BLUE;
    ctx.translate(985, 1000);
    ctx.rotate(Math.PI / 12);
    ctx.strokeRect(-110, -110, 220, 220);
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = 0.16;
    ctx.fillStyle = RED;
    ctx.beginPath();
    ctx.moveTo(880, 110);
    ctx.lineTo(1000, 320);
    ctx.lineTo(760, 320);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function draw(card) {
    var canvas = document.createElement('canvas');
    canvas.width = SIZE;
    canvas.height = SIZE;
    var ctx = canvas.getContext('2d');
    var family = getComputedStyle(document.body).fontFamily || 'sans-serif';

    ctx.fillStyle = '#f8f8f8';
    ctx.fillRect(0, 0, SIZE, SIZE);
    decorate(ctx);

    ctx.fillStyle = RED;
    ctx.beginPath();
    ctx.arc(116, 122, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = INK;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.font = '700 44px ' + family;
    ctx.fillText('MST', 160, 125);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = RED;
    fitText(ctx, String(card.value), 700, 340, family, 900);
    ctx.fillText(String(card.value), SIZE / 2, 590);

    ctx.fillStyle = GRAY;
    ctx.font = '500 60px ' + family;
    ctx.fillText(card.unit, SIZE / 2, 680);

    ctx.fillStyle = INK;
    fitText(ctx, card.title, 700, 72, family, 940);
    ctx.fillText(card.title, SIZE / 2, 820);

    ctx.fillStyle = GRAY;
    fitText(ctx, card.detail, 400, 36, family, 940);
    ctx.fillText(card.detail, SIZE / 2, 890);

    if (card.host) {
      ctx.font = '500 30px ' + family;
      ctx.fillText(card.host, SIZE / 2, 1010);
    }
    return canvas;
  }

  function download(blob, name) {
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function save(card) {
    var name = 'mst-' + card.value + card.unit + '.png';
    draw(card).toBlob(function (blob) {
      if (!blob) return;
      var file = new File([blob], name, { type: 'image/png' });
      var touch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
      var canShare = touch && navigator.canShare && navigator.canShare({ files: [file] });
      if (!canShare) {
        download(blob, name);
        return;
      }
      navigator.share({ files: [file] }).catch(function (e) {
        if (!e || e.name !== 'AbortError') download(blob, name);
      });
    }, 'image/png');
  }

  window.MSTResultCard = { draw: draw, save: save };
})();
