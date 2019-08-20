var getVideo = function(requestParams, callback) {
    let urls = [requestParams.url];
    const video = window.document.createElement('video');
    video.muted = true;
    video.loop = true;
    video.crossOrigin = 'Anonymous';
    video.onloadeddata = function() {
        // wait for data to be loaded to return  the  video
        callback(null, video);
    };
    // should be set by video
    video.width = 256;
    video.height = 256;

    // for now  we use only 1 url
    for (let i = 0; i < urls.length; i++) {
        const s = window.document.createElement('source');
        s.src = urls[i];
        video.appendChild(s);
    }

    video.play()
    map.triggerRepaint()
    let event = new CustomEvent('video-added', {detail: {video: video}})
    let element = document.getElementById('map')
    element.dispatchEvent(event)

    return { cancel: () => {} };
};

var videoStyle = {
    "version": 8,
    "sources": {
        "video": {
            "type": "raster",
            "tiles": [
                "http://localhost:8080/result/{z}/{x}/{y}.webm"
            ],
            tileSize: 512,
            getImage: getVideo,
            scheme: 'xyz'
        }
    },
    "layers": [{
        "id": "video",
        "type": "raster",
        "source": "video"
    }]
};
var map = new mapboxgl.Map({
    container: 'map',
    zoom: 0,
    center: [-122.514426, 37.762984],
    style: videoStyle,
    hash: false
});

let mapElement = document.getElementById('map')
let videos = []
mapElement.addEventListener('video-added', function(e) {
    let video = e.detail.video
    videos.push(video)
    // add timersrc here...
    video.addEventListener('playing', () => {
        map.triggerRepaint();
    });
    map.triggerRepaint()
});
