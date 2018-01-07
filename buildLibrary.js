var browserify = require("browserify");
var tsify = require("tsify");

browserify({standalone: 'Pulke'})
    .add("./src/Pulke.ts")
    .plugin("tsify", { noImplicitAny: true })
    .bundle()
    .pipe(process.stdout);