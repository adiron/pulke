import { Pulke } from './Pulke';

let pulke = new Pulke({
    selector: "#canvas",
    duration: 5000,
    loop: true,
    loopTimes: 0,
    items: [{selector: ".ball", props: [{
        property: "width",
        keyframes: [
            {position: 0, value: 20},
            {position: 0.5, value: 50},
            {position: 0.6, value: 10},
            {position: 1, value: 70}
        ]
    }]}]
})

pulke.play();