# Jsoneditor WARNING

The `Jsoneditor` library from https://github.com/josdejong/jsoneditor was modified, because Mozilla rejects code with `Unsafe assignment to innerHTML`.

The added method `_setHTML` in `jsoneditor-minimalist.js` uses the DOMParser() Web API workaround described on https://devtidbits.com/2017/12/06/quick-fix-the-unsafe_var_assignment-warning-in-javascript.
