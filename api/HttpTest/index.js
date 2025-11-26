module.exports = async function (context, req) {
    context.res = {
        status: 200,
        body: { message: "API is alive", time: new Date().toISOString() }
    };
};
