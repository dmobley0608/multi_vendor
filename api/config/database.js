export default {
    // ...existing config...
    dialectOptions: {
        useUTC: false, // for reading from database
        dateStrings: true,
        typeCast: function (field, next) {
            if (field.type === 'DATETIME') {
                return field.string()
            }
            return next()
        },
    },
    timezone: '-04:00' // for writing to database (adjust to your timezone)
}
