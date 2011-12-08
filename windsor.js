/*
    Windsor: a browser-based runtime for Bowtie themes
*/

var Windsor = {};

// Runtime class
Windsor.Runtime = function(){
    var wr = this;
    this.ignoreHTTPStatusCodes = false; // useful for debugging locally
    
    this.API = {
        Bowtie: {
            addMouseTrackingForElement: function(element, callback){
                
            },
            buildVersion: function(){
                
            },
            currentFrame: function(){
                
            },
            currentSourceName: function(){
                
            },
            escape: function(str){
                
            },
            log: function(str){
                
            },
            preferenceForKey: function(key){
                
            },
            setFrame: function(xOffset, yOffset, width, height){
                
            },
            setPreferenceForKey: function(value, key){
                
            },
            version: function(){
                
            }
        },
        Player: {
            canShow: function(){
                
            },
            currentTrack: function(){
                
            },
            isConnected: function(){
                
            },
            name: function(){
                
            },
            nextTrack: function(){
                
            },
            pause: function(){
                
            },
            play: function(){
                
            },
            playerPosition: function(){
                
            },
            playPause: function(){
                
            },
            playState: function(){
                
            },
            previousTrack: function(){
                
            },
            rating: function(){
                
            },
            ratingStars: function(){
                
            },
            renderedArtwork: function(){
                
            },
            repeat: function(){
                
            },
            setPlayerPosition: function(position){
                
            },
            setRating: function(rating){
                
            },
            setRepeat: function(repeat){
                
            },
            setShuffle: function(shuffle){
                
            },
            setVolume: function(volume){
                
            },
            show: function(){
                
            },
            shuffle: function(){
                
            },
            stop: function(){
                
            },
            uniqueString: function(){
                
            },
            volume: function(){
                
            }
        },
        Lastfm: {
            ban: function(){
                // no-op
            },
            isConfigured: function(){
                return false;
            },
            isEnabled: function(){
                return false;
            },
            love: function(){
                // no-op
            }
        }
    };
    
    // semi-private event handling (we expose __emit, but not the internals)
    var listeners = {
        'themeMetadataLoaded': [],
        'themeLoaded': [],
        'themeLoadFailed': []
    };
    
    this.addEventListener = function(event, callback){
        if (event in listeners)
            listeners[event].push(callback);
    };
    this.removeEventListener = function(event, callback){
        if (event in listeners)
        {
            var idx = listeners[event].indexOf(callback);
            if (idx > -1)
                listeners[event].splice(idx, 1);
        }
    };
    this.__emit = function(event, args){
        args = (args != null) ? args : [];
        if (event in listeners)
        {
            var lcount = listeners[event].length;
            for (var i = 0; i < lcount; i++)
                listeners[event][i].apply(this, args);
        }
    };
    
    // iframe tracking
    var iframes = [];
    this.__trackIframe = function(ifr){
        iframes.push(ifr);
    };
    this.__stopTrackingIframe = function(ifr){
        var idx = iframes.indexOf(ifr);
        if (idx > -1)
            iframes.splice(idx, 1);
    };
    this.__walkIframes = function(method, args){
        for (var i = 0; i < iframes.length; i++)
            iframes[i][method].apply(this, args);
    };
};
/*
    This method will load a theme's metadata, parse it, and then load the
    actual theme itself into a hidden iframe. When it completes, you will receive the iframe with
    "display: none" set on its style attribute.
*/
Windsor.Runtime.prototype.loadTheme = function(address, callback, container){
    var wr = this;
    container = (container != null) ? container : document.body;
    
    var metadataReq = new XMLHttpRequest();
    metadataReq.open('GET', address + '/Info.plist', true);
    metadataReq.onreadystatechange = function(){
        if (metadataReq.readyState == 4)
        {
            if (wr.ignoreHTTPStatusCodes || metadataReq.status == 200)
            {
                var keys = metadataReq.responseXML.getElementsByTagName('key');
                var metadata = {};
                var nextSibling;
                for (var i = 0; i < keys.length; i++)
                {
                    if (keys[i].nextSibling != null)
                    {
                        nextSibling = keys[i].nextSibling;
                        while (nextSibling.nodeType != 1)
                            nextSibling = nextSibling.nextSibling;
                        
                        metadata[keys[i].textContent] = nextSibling.textContent;
                    }
                }
                
                wr.__emit('themeMetadataLoaded', [metadata]);
                
                if ('BTMainFile' in metadata && 'BTWindowWidth' in metadata && 'BTWindowHeight' in metadata)
                {
                    var iframe = document.createElement('iframe');
                    iframe.style.display = 'none';
                    iframe.style.border = 'none';
                    iframe.src = address + '/' + metadata['BTMainFile'];
                    iframe.width = metadata['BTWindowWidth'];
                    iframe.height = metadata['BTWindowHeight'];
                    iframe.onload = function(){
                        Windsor.Utils.augmentIframe(iframe, wr, metadata);
                        
                        if (typeof(callback) == 'function')
                            callback(true, iframe);
                        
                        wr.__emit('themeLoaded', [iframe]);
                    };
                    container.appendChild(iframe);
                }
            }
            else
            {
                if (typeof(callback) == 'function')
                    callback(false);
                
                wr.__emit('themeLoadFailed');
            }
        }
    };
    metadataReq.send(null);
};
Windsor.Runtime.prototype.changeTrack = function(track){
    this.__walkIframes('WRTrackChanged', [track]);
};
Windsor.Runtime.prototype.changeArtwork = function(address){
    this.__walkIframes('WRArtworkChanged', [address]);
};
Windsor.Runtime.prototype.changePlayState = function(playState){
    this.__walkIframes('WRPlayStateChanged', [playState]);
};

// Track class
Windsor.Track = function(name, artist, album, length, genre){
    this.name = (name != null) ? name : null;
    this.artist = (artist != null) ? artist : null;
    this.album = (album != null) ? album : null;
    this.genre = (genre != null) ? genre : null;
    this.length = (length != null) ? length : 0.0;
};

// Utility functions
Windsor.Utils = {};
Windsor.Utils.noop = function(){
    // do nothing
};

Windsor.Utils.augmentIframe = function(iframe, wr, metadata){
    iframe.contentWindow.Bowtie = wr.API.Bowtie;
    iframe.contentWindow.Player = wr.API.Player;
    iframe.contentWindow.iTunes = wr.API.Player;
    iframe.contentWindow.Lastfm = wr.API.Lastfm;
    
    iframe.WRTrackChanged = ('BTTrackFunction' in metadata) ? function(){
        iframe.contentWindow[metadata['BTTrackFunction']].apply(iframe.contentWindow, arguments);
    } : Windsor.Utils.noop;
    
    iframe.WRArtworkChanged = ('BTArtworkFunction' in metadata) ? function(){
        iframe.contentWindow[metadata['BTArtworkFunction']].apply(iframe.contentWindow, arguments);
    } : Windsor.Utils.noop;
    
    iframe.WRPlayStateChanged = ('BTPlayStateFunction' in metadata) ? function(){
        iframe.contentWindow[metadata['BTPlayStateFunction']].apply(iframe.contentWindow, arguments);
    } : Windsor.Utils.noop;
    
    wr.__trackIframe(iframe);
    
    if ('BTReadyFunction' in metadata)
        iframe.contentWindow[metadata['BTReadyFunction']]();
}
