
const searchInput = document.getElementById('searchBar');
const selectIngredients = document.getElementById('selectIngredients');
const searchResult = document.getElementById('searchResult');
const searchBTN = document.getElementById('searchBTN');

let ingredientsList = [];
let ingredientName = '';
let recipeCard;

let numRecipeResults = 3;

function addElement(parent, newElement, content, addID, textContent = true) {
    var element = document.createElement(newElement);
    parent.appendChild(element);

    if (!textContent) {
        element.innerHTML = content;
    }
    else if (content && textContent) {
        element.appendChild(document.createTextNode(content));
    }

    if (addID) {
        element.setAttribute("id", addID);
    }

    return element;
}

function deleteElement(element) {
    if (element != null && element != NaN && element != undefined) {
        element.parentElement.removeChild(element);
    }
}

const searchCodeBar = (e) => {
    let barCode = e.target.value;
    if (!Number.isNaN(barCode)) {

        getIngredientsName(barCode);
        console.log(e.target.value);

    } else showError("Please insert a valid bar code!");

}

function clearSearchCodeBar(e) {
    e.target.value = '';
}

async function getIngredientsName(barcode) {
    let barCodePromise;
    let ingredientData;

    const bardCodeURL = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;

    try {
        barCodePromise = await fetch(bardCodeURL);
        ingredientData = await barCodePromise.json();

        ingredientName = ingredientData.product.compared_to_category.toLowerCase().replaceAll("en:", "").replaceAll("-", " ");

        console.log("barcode: " + barcode);
        console.log(ingredientData);
        console.log("ingredientName:" + ingredientName);

        addIngredients(ingredientName);
        return ingredientName;

    } catch (error) {
        if (error.name = "TypeError") {

            showError("Please insert a valid bar code!");
            console.log(error);
        }
        else showError(error);
    }
}


function addIngredients(ingredientName) {

    if (ingredientsList.length == 0) {
        let ingredient = addElement(selectIngredients, "li", ingredientName, ingredientName);

        ingredient.classList.add("strongList");

        ingredientsList.push(ingredientName);

        ingredient.addEventListener("click", (event) => {
            cleanRecipesRestults();
            deleteIngredient(event);
        });
    }
    else if (ingredientsList.indexOf(ingredientName) < 0) {
        let ingredient = addElement(selectIngredients, "li", ingredientName, ingredientName);
        ingredient.classList.add("strongList");

        ingredientsList.push(ingredientName);

        ingredient.addEventListener("click", (event) => {
            cleanRecipesRestults();
            deleteIngredient(event);
        });
    }
    else return;
}

function deleteIngredient(event) {

    let ingredient = event.target;
    let ingredientIndex = ingredientsList.indexOf(ingredient.id);
    console.log(ingredientIndex);
    console.log(ingredient.id);

    ingredientsList.splice(ingredientIndex, 1);
    deleteElement(ingredient);

}

async function getRecipes() {

    let ingredientsString = '';
    ingredientsList.forEach(ingredient => {
        ingredientsString = ingredientsString + ", " + ingredient;
    });

    const RecipeByIngredientURL = `https://api.spoonacular.com/recipes/complexSearch?includeIngredients=${ingredientsString}&addRecipeInformation=true&instructionsRequired=true&sort=popularity&limitLicense=false&number=${numRecipeResults}&apiKey=cecb971fd9cb4f99b111a23e21d05438`;

    let recipesPromise;
    let recipesData;

    try {
        recipesPromise = await fetch(RecipeByIngredientURL);
        recipesData = await recipesPromise.json();

    } catch (error) {
        showError(error);
    }

    console.log(recipesData);
    showRecipes(recipesData);

    // const RecipeByIngredientURL = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredientsString}&addRecipeInformation=true&instructionsRequired=true&sort=popularity&limitLicense=false&number=${numRecipeResults}&apiKey=0642a228dec44d00a6dc51e1470af6d4`;

    // https://api.spoonacular.com/recipes/324694/analyzedInstructions
}

function showRecipes(recipesData) {

    if (recipesData.totalResults <= 0) {
        addElement(searchResult, "h2", "NO RECIPES FOUND", "noResultsFound");
    }
    recipesData.results.forEach((recipeObject) => {

        recipeCard = addElement(searchResult, "section", undefined, "recipeCard");

        showRecipeHeader(recipeObject);
        showRecipeInstructions(recipeObject);
    });
}

function showRecipeHeader(recipeObject) {

    let recipeHeader = addElement(recipeCard, "div", undefined, "recipeHeader");
    recipeHeader.classList.add("cardHeader");

    let recipeTitle = addElement(recipeHeader, "h3", recipeObject.title);
    recipeTitle.classList.add("p-5");

    let recipeImg = addElement(recipeHeader, "img");
    recipeImg.setAttribute('src', recipeObject.image);
    recipeImg.classList.add("cardHeaderImg");
}

function showRecipeInstructions(recipeObject) {

    let recipeInstructions = recipeObject.analyzedInstructions[0].steps;

    let recipeSteps = addElement(recipeCard, "article", undefined, "recipeSteps");
    recipeSteps.classList.add("cardMain");

    recipeInstructions.forEach((instructionStep) => {

        let recipeInstruction = addElement(recipeSteps, "p", "<strong>" + instructionStep.number + "</strong>. " + instructionStep.step, undefined, false);
    });
}

function showError(error) {

    let errPopup = document.getElementById("modalPopUp");
    let errorCloseBTN = document.getElementById("errorBTN");
    let errorText = document.getElementById("modalText");

    errPopup.classList.replace("hidden", "flex");
    errorText.innerHTML = error;

    errorCloseBTN.addEventListener("click", () => {
        errPopup.classList.replace("flex", "hidden");
    });
}

function cleanRecipesRestults() {
    if (searchResult) {
        while (searchResult.childElementCount > 0) {

            deleteElement(document.getElementById('noResultsFound'));
            deleteElement(document.getElementById('recipeCard'));
        }
    }
    else getRecipes();
}

searchInput.addEventListener('input', (event) => {
    cleanRecipesRestults();
    searchCodeBar(event);
});

searchInput.addEventListener('focusin', (event) => {
    clearSearchCodeBar(event);
});
searchBTN.addEventListener('click', () => {
    cleanRecipesRestults();
    getRecipes();
});
