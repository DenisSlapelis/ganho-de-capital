export const debug = (message: string, data?: any) => {
    const validLogLevels = ['DEBUG'];

    if (validLogLevels.includes(process.env.LOG_LEVEL || ''))
        data ? console.debug(`[${new Date().toISOString()}] ${message}`, data) : console.debug(`[${new Date().toISOString()}] ${message}`);
};

export const info = (message: string, data?: any) => {
    const validLogLevels = ['DEBUG', 'INFO'];

    if (validLogLevels.includes(process.env.LOG_LEVEL || ''))
        data ? console.info(`[${new Date().toISOString()}] ${message}`, data) : console.info(`[${new Date().toISOString()}] ${message}`);
};

export const error = (message: string, data?: any) => {
    const validLogLevels = ['DEBUG', 'INFO', 'ERROR'];

    if (validLogLevels.includes(process.env.LOG_LEVEL || ''))
        data ? console.error(`[${new Date().toISOString()}] ${message}`, data) : console.error(`[${new Date().toISOString()}] ${message}`);
};
