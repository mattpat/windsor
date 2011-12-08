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

Configuring a Player
--------------------
You have complete control over what kind of "music player" Bowtie is controlling.

The `Runtime` object has two top-level properties: `playerName` and `playerDelegate`. The first is the name of your music player (the default is "iTunes"), and is what gets returned if the theme calls `Bowtie.currentSourceName()` or `Player.name()`. The second is an object that acts as a bridge to the theme's `Player`/`iTunes` object. The methods of this object get called when the theme makes calls on the `Player` object (like if the user clicks a play or next track button, for instance).

You can implement as many or as few of the following methods in the player delegate object as you'd like (see the [Player Object Reference][player] for details on what each of these methods should do; reasonable defaults are provided for some of the more obscure ones):

  [player]: http://library.13bold.com/developing-themes-for-bowtie/player-reference/

* canShow()
* currentTrack()
* isConnected()
* nextTrack()
* pause()
* play()
* playerPosition()
* playPause()
* playState()
* previousTrack()
* rating()
* repeat()
* setPlayerPosition(position)
* setRating(rating)
* setRepeat(repeat)
* setShuffle(shuffle)
* setVolume(volume)
* show()
* shuffle()
* stop()
* uniqueString()
* volume()

You can then call the `Runtime` methods `changeTrack(trackObj)`, `changeArtwork(url)`, and `changePlayState(state)` to notify the theme that the track, artwork, and play state have changed, respectively.

Below is a sample implementation of a way to interface Windsor with a fictitious HTML5 audio player called "TunesPlayer":

    var tunesPlayer = new TunesPlayerSuperAmazingAwesomeMusicPlayer();
    // imagine this plays audio, and has methods like .play() and .pause()
    
    var runtime = new Windsor.Runtime();
    runtime.playerName = 'TunesPlayer';
    runtime.playerDelegate = {
        play: function(){
            // tell the audio player to play
            tunesPlayer.play();
        },
        pause: function(){
            // tell the audio player to pause
            tunesPlayer.pause();
        },
        nextTrack: function(){
            // tell the audio player to advance to the next track
            tunesPlayer.next();
        },
        previousTrack: function(){
            // tell the audio player to advance to the next track
            tunesPlayer.previous();
        }
    };
    
    // give feedback when the not-real TunesPlayer tells us the track changes
    tunesPlayer.ontrackchange = function(track, artworkURL){
        runtime.changeTrack({title: track.title, artist: track.artist, album: track.album});
        runtime.changeArtwork(artworkURL);
    };
    tunesPlayer.onplaystatechange = function(paused){
        if (paused)
            runtime.changePlayState(2);
        else
            runtime.changePlayState(1);
    };

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