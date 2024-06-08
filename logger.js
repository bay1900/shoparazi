const pino = require('pino')


  

const transport = pino.transport({
    targets: [
      {
        target: 'pino/file',
        options: { destination: `${__dirname}/app.log` },
      },
      {
        target: 'pino/file',
      },
    ],
  });

const levels = {
    danger: 90,
    emerg: 80,
    alert: 70,
    crit: 60,
    error: 50,
    warn: 40,
    notice: 30,
    info: 20,
    debug: 10,
  };

module.exports = pino({
    // enabled: !!process.env.NOLOG,                // DISABLE LOG
    level: process.env.PINO_LOG_LEVEL || 'info', // SET DEFAULT LEVEL
    customLevels: levels,                        // CUSTOM LEVEL
    formatters: {                                // CUSTOM FIELD
        level: (label) => {
        return { 
                //  level: label.toUpperCase(), 
                 severity: label.toUpperCase()
                };
        },
        bindings: (bindings) => { 
            return { 
                id: bindings.pid, 
                // host: bindings.hostname,
            }
        },
    },
    redact: { 
              paths : ['response.age', 'data'],
              censor: '*',
            //    remove: true 
            }, 
    timestamp: () => `,"timestamp":"${new Date(Date.now()).toISOString()}"`
}, 
// pino.destination(`${__dirname}/app.log`)
// transport   // *** Register transport ***
);