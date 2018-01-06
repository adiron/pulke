import { Pulke } from './Pulke';

let pulke = new Pulke({
    selector: "#canvas",
    duration: 5000,
    loop: true,
    loopTimes: 0,
    items: [{selector: ".ball", props: [{
        property: "height",
        ease: "linear:granular 20",
        keyframes: [
            {position: 0, value: 120, ease: "linear:granular 10"},
            {position: 0.5, value: 50},
            {position: 0.6, value: 30},
            {position: 1, value: 120}
        ]
    },
    {
        property: "width",
        keyframes: [
            {position: 0, value: 120},
            {position: 0.5, value: 50},
            {position: 1, value: 120}
        ],
        unit: "%"
    }
  ]}]
})

pulke.play();