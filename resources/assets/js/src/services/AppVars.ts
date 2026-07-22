const appVarsElement = document.getElementById("appVars");
if (appVarsElement === null) {
    throw new Error("no #appVars element on the page.");
}
const rawAppVars = appVarsElement.dataset.appVars;
if (rawAppVars == null) {
    throw new Error("no data-app-vars attribute on #appVars.");
}

const appVars: Record<string, unknown> = JSON.parse(rawAppVars);

export default appVars;
