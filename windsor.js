/*
    Windsor: a browser-based runtime for Bowtie themes
*/

var Windsor = {};

// Runtime class
Windsor.Runtime = function(){
    var wr = this;
    this.ignoreHTTPStatusCodes = false; // useful for debugging locally
    this.showOnLoad = false;
    this.playerName = 'iTunes';
    
    // iframe tracking
    var iframe = null;
    this.__trackIframe = function(ifr){
        iframe = ifr;
    };
    this.__targetIframe = function(method, args){
        iframe[method].apply(this, args);
    };
    this.__destroyIframe = function(){
        if (iframe == null)
            return false;
        
        if ('WRStatusInterval' in iframe)
        {
            clearInterval(iframe.WRStatusInterval);
            delete iframe.WRStatusInterval;
        }
        
        if (iframe.parentNode != null)
            iframe.parentNode.removeChild(iframe);
        iframe = null;
        
        return true;
    };
    
    // theme API
    this.API = {
        Bowtie: {
            addMouseTrackingForElement: function(element, callback){
                element.addEventListener('mouseover', function(){
                    callback(true, element);
                });
                element.addEventListener('mouseout', function(){
                    callback(false, element);
                });
            },
            buildVersion: function(){
                return 1400;
            },
            currentFrame: function(){
                if (iframe == null)
                    return [0, 0, 0, 0];
                
                return [0, 0, iframe.width, iframe.height];
            },
            currentSourceName: function(){
                return wr.playerName;
            },
            escape: function(str){
                str = str.replace("&", "&amp;");
        		str = str.replace("<", "&lt;");
        		str = str.replace(">", "&gt;");
        		return str;
            },
            log: function(str){
                if (console && 'log' in console)
                    console.log('Bowtie Theme: ' + str);
            },
            preferenceForKey: function(key){
                if (iframe == null)
                    return undefined;
                
                if (typeof(localStorage) == 'undefined')
                    return undefined;
                
                var result = localStorage.getItem('WR#' + iframe.WRThemeMetadata['BTThemeIdentifier'] + '#' + key);
                return (result == null) ? undefined : result;
            },
            setFrame: function(xOffset, yOffset, width, height){
                // no-op
            },
            setPreferenceForKey: function(value, key){
                if (iframe == null)
                    return undefined;
                
                if (typeof(localStorage) == 'undefined')
                    return undefined;
                
                localStorage.setItem('WR#' + iframe.WRThemeMetadata['BTThemeIdentifier'] + '#' + key, value);
            },
            version: function(){
                return '1.4';
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
        'themeLoadFailed': [],
        'themeUnloaded': []
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
};
/*
    This method will load a theme's metadata, parse it, and then load the
    actual theme itself into a hidden iframe. When it completes, you will receive the iframe with
    "display: none" set on its style attribute.
*/
Windsor.Runtime.prototype.loadTheme = function(address, callback, container){
    var wr = this;
    container = (container != null) ? container : document.body;
    
    this.unloadTheme();
    
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
                        
                        if (wr.showOnLoad)
                            iframe.style.display = null;
                        
                        if ('BTStatusFunction' in metadata)
                            iframe.WRStatusInterval = setInterval(iframe.WRStatusUpdate, 1000);
                        
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
Windsor.Runtime.prototype.unloadTheme = function(){
    if (this.__destroyIframe())
        this.__emit('themeUnloaded');
};
Windsor.Runtime.prototype.changeTrack = function(track){
    this.__targetIframe('WRTrackChanged', [track]);
};
Windsor.Runtime.prototype.changeArtwork = function(address){
    this.__targetIframe('WRArtworkChanged', [address]);
};
Windsor.Runtime.prototype.changePlayState = function(playState){
    this.__targetIframe('WRPlayStateChanged', [playState]);
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
    iframe.WRThemeMetadata = metadata;
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
    
    iframe.WRStatusUpdate = ('BTStatusFunction' in metadata) ? function(){
        iframe.contentWindow[metadata['BTStatusFunction']].apply(iframe.contentWindow, arguments);
    } : Windsor.Utils.noop;
    
    wr.__trackIframe(iframe);
    
    if ('BTReadyFunction' in metadata)
        iframe.contentWindow[metadata['BTReadyFunction']]();
}
