Windsor
=======
Windsor (and allusion to the [Windsor knot][knot]) is a browser-based runtime for Bowtie themes. It allows you to load an arbitrary Bowtie theme hosted at your domain into an [iframe][iframe], and then manipulate what it displays.

Windsor is expected to work in Safari, Chrome, and any other WebKit-based browser, but it is recommended that you restrict its use to Safari: Bowtie themes are designed to run on OS X's system-provided WebKit, which is the same WebKit used by Safari. While various WebKit versions are mostly the same, some may introduce new features, exclude other features, and may demonstrate very subtle differences in rendering.

  [knot]: http://en.wikipedia.org/wiki/Windsor_knot
  [iframe]: http://www.w3.org/TR/html5/the-iframe-element.html

Usage
-----
Start out by creating an instance of the runtime object:

    var runtime = new Windsor.Runtime();

When you're ready to load a theme, call the `loadTheme` method of the runtime with the address of the theme (it can be relative, and *must* be in the same origin as the host website), an optional callback to be called when the theme finishes loading (can be `null`), and optionally the element that you want to contain your theme's iframe (this defaults to `document.body`).

    runtime.loadTheme('Default.bowtie', function(success, iframe){
        if (success)
        {
            // show the iframe, nothing fancy, just "appears"
            iframe.style.display = null;
        }
    });

Your callback receives two parameters: `success`, which is a boolean indicating whether or not the theme loaded into the browser; and `iframe`, which is a reference to the DOM element representing. When this callback is called, the iframe will have "display: none" set in its `style` attribute -- this gives you the opportunity to fade it in, perform animations, or just display it immediately.

**IMPORTANT NOTE**: it is strongly advisable that you *DO NOT* move the iframe around in the DOM (or at the very least, do not remove and then reappend it). If you need the iframe to be contained by a particular element, pass it as the third parameter to `loadTheme`.

More Details
------------
The main entry point of Windsor is the `Runtime` class. You can load one theme at a time per runtime, but you can have multiple runtimes if you'd like to have more than one theme running on your page (though I'm not sure why you would).

Windsor implements the entire [Bowtie Theme API][api] and exposes it to an iframe containing a Bowtie theme. The implementation currently reflects the Theme API as of Bowtie 1.4, so Windsor identifies itself to the theme as such (version 1.4, build 1400).

  [api]: http://library.13bold.com/developing-themes-for-bowtie/

In order for Windsor to work, the theme you want to load **must be hosted on the same domain as the website using Windsor**. This is because most web browsers prevent scripting interoperability between frames that are not served out of the same origin (as rightly they should!).

Note also that, in newer builds of Chrome and future builds of Safari, **artwork must also be served from the same origin**, or else it will not display. This is because Windsor uses `canvas` to render artwork (using `toDataURL`, for theme compatibility) according to a theme's `Info.plist` settings rather than just passing off URLs immediately. For more information, see [the MDN article on CORS Enabled Images][cors].

  [cors]: https://developer.mozilla.org/en/CORS_Enabled_Image

License
-------
    Copyright (C) 2011 Matt Patenaude.

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.