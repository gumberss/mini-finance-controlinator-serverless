const decoratorValidator = (fn, schema, argsType) => {
    return async function(event){
        return fn.apply(this, arguments)
    }
}

module.exports = decoratorValidator;