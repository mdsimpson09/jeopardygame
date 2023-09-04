const BASE_URL = "http://jservice.io/api/"
const NUM_CATEGORIES = 6

let categories = [];

async function getCategoryIds() {

    const resp = await axios.get(`${BASE_URL}categories?count=100`);
    return _.sampleSize(resp.data, NUM_CATEGORIES);

}
 async function getCategory(catId) {
   const resp = await axios.get(`${BASE_URL}category?id=${catId}`)
    const title = resp.data.title;
    const clues = resp.data.clues.map(each => {
    const {question, answer} = each;
     return ({question, answer, showing: null})
    });

   return ({title, clues})
}
/** Creates rows for table body with proper id (C{category index}-Q{question index})
 * Returns the body text, which needs to be inserted into the game table body
 */

function rowsBuilder(){
    let tbody = ""

    for (let row = 0; row < 5; row++){
        let trow = "<tr>"
        let catNum = 0

        for (let each in categories){
            trow += `<td class="Q-tile" id="C${catNum}-Q${row}">?</td>`
            catNum++;
        }
        trow += "</tr>"
        tbody += trow;
    }
    return tbody;
}



function fillTable() {
    let thead = "";

    for (let each of categories){
        thead += `<th class="header-tile"> ${each.title}</th>`
    };

    $("#categories").empty()
        .html(thead);

    let tbody = rowsBuilder();

    $("tbody").empty()
        .html(tbody);
}


function handleClick(evt) {
    $tile = $(evt.target)
    const cat = $tile[0].id[1];
    const quest = $tile[0].id[4];

    const fullObj = categories[cat].clues[quest];
    
    if(fullObj.showing == null){
        $tile.empty()
            .text(fullObj.question);
            categories[cat].clues[quest].showing = "question"
    } else if( fullObj.showing == "question"){
        $tile.empty()
            .text(fullObj.answer);
            categories[cat].clues[quest].showing = "answer"
    }
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
    $("#loader").toggleClass("hidden")
    $("button").text("Loading")
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
    $("#loader").toggleClass("hidden")
    $("button").text("Start New Game")
    $("tbody").on("click", "button", setupAndStart);
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
    categories = [];
    showLoadingView();
    const catIds = await getCategoryIds()
    for (let each of catIds){
        let cat = await getCategory(each.id);
        categories.push(cat);
    }
    // categories = Promise.all(catIds.map(each => {
    //     const cat = await getCategory(each.id);
    //     return cat
    // }))
    fillTable();
    hideLoadingView();
    
}

setupAndStart();


$("tbody").on("click", "td", handleClick);

$("#game-but").on("click", setupAndStart);