grunt-bunyan
==========

Grunt plugin for piping grunt output through bunyan cli.

## Installation

Install grunt-bunyan using npm:

```
$ npm install grunt-bunyan
```

Then add this line to your project's *Gruntfile.js*:

```javascript
grunt.loadNpmTasks('grunt-bunyan');
```

## Configuration
```js
grunt.initConfig({
    bunyan: {
        strict: true, // prevent non-bunyan logs from being outputted
        level: 'trace', // show all the things!
        output: 'short', // least verbose
    }
});
```
## Usage
```bs
grunt bunyan [task] ...
```
where the `bunyan` task is followed by tasks that output bunyan logging that you wish to filter

#### Filtering by name
```bs
grunt bunyan:log-name [task] ...
```
to show the output for multiple logs, just keep specifying log names
```bs
grunt bunyan:log-name1:log-name2:log-name3 [task] ...
```
you can also just combine grunt tasks to achieve the same thing
```bs
grunt bunyan:log-name1 bunyan:log-name2 [task] ...
```
to *hide* a specific log's output, use `~` before the log name
```bs
grunt bunyan:~unwanted-log-name [task] ...
