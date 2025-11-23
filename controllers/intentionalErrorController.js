/*** This controller exists to create an exception for testing */
const intentionalErrorController = {};

/*** Cause an intentional error for testing*/
intentionalErrorController.causeError = async function(req, res, next) {
    console.log("Causing an error...");
    let aNumber = 1/0;
    throw new Error("This is an intentional error."); // THIS will trigger the 500
    // The render templates expect data that is not being provided. This will also cause an exception.
    res.render("./", {
        title: "Intentional Error",
    })
}
module.exports =
    intentionalErrorController;