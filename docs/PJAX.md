# Pjax

## How it works

1.  Use the forked version of pjax (github.com/karigari/pjax), branch is `karigari`. The fork removes `pushState` calls from inside the library.

2.  Every pjax call is made using `loadUrl`. This method constructs the state that GitHub uses, and we continue with that hereon.

## Test cases

1.  Basic file view: clicking on tree link should trigger pjax, and show loader.

2.  Basic file view: cmd+click on tree link should open in a new tab (background/foreground depending on local settings)

3.  Basic file view: right-click on tree link should show new tab option.

4.  PR view: click on tree link in conversations tab should open the files changed view and scroll to the correct file. Files changed view should be `full-width`. Going back from here should open conversation without `full-width`.

5.  PR view: go from pulls list --> open a PR --> go to files changed view (via tree link) --> go back (should open conversation) --> go back (should open pulls list)

6.  Expanded code box: open file should trigger pjax, and after file loads, it should highlight the correct line number. Going back should go back to the previous page.

7.  Expanded code box: cmd-click on open file?
