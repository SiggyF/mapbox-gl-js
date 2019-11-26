var getVideo = function(requestParams, callback) {
    let urls = [requestParams.url];
    const video = window.document.createElement('video');
    video.muted = true;
    video.loop = true
    video.crossOrigin = 'anonymous';
    video.setAttribute('preload', 'auto');
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

    let debugDiv = document.getElementById('debug')
    debugDiv.appendChild(video)

    return { cancel: () => {} };
};

const fps = 30
const duration = 10

var videoStyle = {
    "version": 8,
    "sources": {
        "video": {
            "type": "raster",
            "tiles": [
                "https://slr.storage.googleapis.com/video/measures/per_month/{z}/{x}/{y}.webm"
            ],
            tileSize: 512,
            getImage: getVideo,
            scheme: 'xyz',
            fps: fps,
            duration: duration
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
    style: videoStyle
});

map.addControl(new mapboxgl.NavigationControl());

map.on('tile-load', (evt) => {
    console.log('tile-load', evt.tile.tileID.canonical)

    let video = evt.tile.img
    if (video.tagName !== "VIDEO") {
        return
    }
    videos[evt.tile.uid] = video

    let sync = MCorp.mediaSync(video, to, {debug: false, loop: true})

    videos[evt.tile.uid] = sync
})
map.on('tile-unload', (evt) => {
    let sync = syncs[evt.tile.uid]
    console.log('tile-unload', evt.tile.tileID.canonical, sync)

})
map.on('tile-abort', (evt) => {
    let sync = syncs[evt.tile.uid]
    console.log('tile-abort', evt.tile.tileID.canonical, sync)

})



let videos = {}
let syncs = {}
var to = new TIMINGSRC.TimingObject({range: [0, duration], duration: duration});


function stop() {
    to.update({
        position: 0.0,
        velocity: 0.0
    })
    map.triggerRepaint()
}


function play() {
    to.update({
        position: 0.0
    })
    to.update({
        velocity: 1.0
    })
    map.triggerRepaint()
}

function next() {
    let v = to.query()
    to.update({
        position: v.position + 1/fps
    })
    map.triggerRepaint()
}

function prev() {
    let v = to.query()
    to.update({
        position: v.position - 0.1
    })
    map.triggerRepaint()
}


var Controls = function() {
    this.speed = 0.8;
    this.stop = stop
    this.play = play
    this.prev = prev
    this.next = next
};
var controls = new Controls()
var gui = new dat.GUI();
gui.add(controls, 'stop');
gui.add(controls, 'play');
gui.add(controls, 'prev')
gui.add(controls, 'next');
