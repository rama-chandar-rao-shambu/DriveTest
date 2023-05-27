const errorHandler = (req, error) => {
    const validationErrors = Object.keys(error.errors).map(key => error.errors[key].message)
    req.flash('validationErrors',validationErrors)
    req.flash('data',req.body);
}

const customErrorHandler = (req, ...message) => {
    req.flash('data', req.body);
    req.flash('validationErrors', message)
}

const customSuccessHandler = (req, ...message) => {
    req.flash('success', message)
}

module.exports = {errorHandler, customErrorHandler, customSuccessHandler};