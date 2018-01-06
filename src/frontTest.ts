import { Pulke } from './Pulke';

let pulke = new Pulke({
    selector: "#canvas",
    duration: 5000,
    loop: true,
    loopTimes: 0,
    items: [{selector: ".ball", props: [{
        property: "attr:cx",
        unit: "%",
        keyframes: [
            {position: 0, value: -2},
            {position: 1, value: 102}
        ]
    },
    {
        property: "attr:cy",
        ease: "bezier 0.17 0.67 0.83 0.67",
        keyframes: [
            {position: 0, value: 10},
            {position: 0.25, value: 120},
            {position: 0.5, value: 10},
            {position: 0.75, value: 120},
            {position: 1, value: 10},
        ],
        unit: "px"
    }
  ]}]
})

pulke.play();