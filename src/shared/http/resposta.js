export function responderSucesso(res, { statusCode = 200, data, message, pagination } = {}) {
    return res.status(statusCode).json({
        success: true,
        ...(data !== undefined && { data }),
        ...(message !== undefined && { message }),
        ...(pagination !== undefined && { pagination }),
    });
}

export function responderErro(res, statusCode, message) {
    return res.status(statusCode).json({
        success: false,
        message,
    });
}
