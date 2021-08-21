const styleCSS = require('../static/style');

module.exports = vm => ({ content, scripts }) => {
  const href = vm.href.replace('http://', '//').replace('https://', '//');

  return `<!DOCTYPE html><html>
  <head>
    <title>${vm.title}</title>
    <meta name="robots" content="index, follow" />
    <meta name="language" content="EN" />
    <meta name="distribution" content="global" />
    <style>${styleCSS}</style>
  </head>
  <body>
    <a href="${vm.href}">
      <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAAB0CAYAAADAUH2QAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABFhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ1dWlkOjY1RTYzOTA2ODZDRjExREJBNkUyRDg4N0NFQUNCNDA3IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkE4NzVDRUU2RjI2MTExRTRCRUVCQTEwNEU0MzAzREYyIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkE4NzVDRUU1RjI2MTExRTRCRUVCQTEwNEU0MzAzREYyIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIElsbHVzdHJhdG9yIENDIChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6YTRlMTNiNDMtMDFlZC00YjY2LWIxZGEtNTk0YzhkMjVjMTZjIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOmE0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" />
    </a>
    <h1>OpenComponents Registry</h1>
    ${content}
    <div class="social">
      <iframe id="gh_badge" src="//ghbtns.com/github-btn.html?user=opencomponents&repo=oc&type=watch&count=true" allowtransparency="true" frameborder="0" scrolling="0" width="110" height="20"></iframe>
    </div>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
    <script src="${href}oc-client/client.js"></script>
    ${scripts}
  </body>
</html>`;
};
