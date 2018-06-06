const NO_STEP_NAME_ERROR_MSG = 'No step name was specified in a gulp.step call! A step name is required.';


const GulpStepPlugin = {
    gulp:          null,
    gulpFunctions: {},
    steps:         {},

    _addStepsToArgs (args) {
        return args.map(arg => {
            if (typeof arg !== 'string')
                return arg;

            const isGulpTask = !!GulpStepPlugin.gulp.registry().get(arg);

            if (isGulpTask || !GulpStepPlugin.steps[arg])
                return arg;

            return GulpStepPlugin.steps[arg];
        });
    },

    install (gulp) {
        if (!gulp)
            gulp = require('gulp');

        GulpStepPlugin.gulp = gulp;

        GulpStepPlugin.gulpFunctions = {
            series:   gulp.series,
            parallel: gulp.parallel
        };

        gulp.step     = GulpStepPlugin.step;
        gulp.series   = GulpStepPlugin.series;
        gulp.parallel = GulpStepPlugin.parallel;
    },

    uninstall () {
        const { gulp } = GulpStepPlugin;

        if (!gulp)
            return;

        delete gulp.step;

        gulp.series   = GulpStepPlugin.gulpFunctions.series;
        gulp.parallel = GulpStepPlugin.gulpFunctions.parallel;

        this.gulp          = null;
        this.gulpFunctions = {};
    },

    step (name, fn) {
        if (!name)
            throw new Error(NO_STEP_NAME_ERROR_MSG);

        if (!fn)
            return GulpStepPlugin.steps[name];

        GulpStepPlugin.steps[name] = fn;

        fn.displayName = name;
    },

    series (...args) {
        args = GulpStepPlugin._addStepsToArgs(args);

        return GulpStepPlugin.gulpFunctions.series.apply(GulpStepPlugin.gulp, args);
    },

    parallel (...args) {
        args = GulpStepPlugin._addStepsToArgs(args);

        return GulpStepPlugin.gulpFunctions.parallel.apply(GulpStepPlugin.gulp, args);
    }
};

module.exports = GulpStepPlugin;