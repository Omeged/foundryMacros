//author: https://github.com/Omeged
let lastRollFormula = localStorage.getItem("rollFormulaLabel") || 1;
let count = 0;
async function RollDice(formula, flavorText = "")
{
  if(formula.search("d")>-1)
  {
    let r = new Roll(formula);
    await r.evaluate();
    await r.toMessage({flavor:flavorText},{rollMode: CONST.DICE_ROLL_MODES.BLIND});
    count = r.total;
  }
  else
  {
    count = formula;
  }
}

await new Promise((resolve) => {
    new Dialog({
      title: "Anzahl zu rollender Ergebnisse",
      content: `
      <html>
        <form>
        <div class="form-group" style="text-align:center">
            <input type="range" id="rollFormula" name="rollFormula" value="1" min="1" max="25" oninput="updateLabel()">
            <input value="${lastRollFormula}" type="text" id="rollFormulaLabel" style="color:blue" oninput="updateSlider()"/>
        </div>
        </form>
        <script>
            function updateLabel() {
            currentValue = document.getElementById("rollFormula").value;
            document.getElementById("rollFormulaLabel").value = currentValue;
            }
            function updateSlider(){
                var sliderValue = document.getElementById("rollFormulaLabel").value;
                document.getElementById("rollFormula").value = sliderValue;
            }
        </script>
    </html>  
      `,
      buttons: {
        ok: {
          label: "OK",
          callback: (html) => {
            resolve(html.find("#rollFormulaLabel")[0].value);
            localStorage.setItem("rollFormulaLabel", html.find("#rollFormulaLabel")[0].value);
            RollDice(html.find("#rollFormulaLabel")[0].value,"Rolled amount of results:");
          },
        },
        cancel: {
          label: "Abbrechen",
        },
      },
    }).render(true);
  });

//#region generates dialog for table name
let lastSelectedOption = localStorage.getItem("lastSelectedOption") || "";

var content =`
        <form>
            <div class="form-group">
                <label for="tableName">Table Name:</label>
                <select name="tableName">
    `;

for(let i = 0; i < game.tables.contents.length;i++)
{
    if(game.tables.contents[i].folder.name.toLowerCase() ==="aktiv" || game.tables.contents[i].folder.name.toLowerCase() ==="active")
    {
      content += `<option value="${game.tables.contents[i].name}"`;
      if(game.tables.contents[i].name ===lastSelectedOption)
        content += "selected";
      content+= `>${game.tables.contents[i].name}</option>`;
    }
}

content += `
  </select>
  </div>
`;


let tableName = await new Promise((resolve) => {
  new Dialog(
      {
    title: "Table Name",
    content: content,
    buttons: {
      ok: {
        label: "OK",
        callback: (html) => {
          resolve(html.find('[name="tableName"]').val());
          localStorage.setItem("lastSelectedOption", html.find('[name="tableName"]').val());
        },
      },
      cancel: {
        label: "Abbrechen",
      },
    },
  }).render(true);
});
//#endregion

/**
 * Roll table with formula from first dialog (can be dice roll or fixed amount), which determines how many results you get.
 * Second dialog determines from which rollable table you will roll. All of them must be in folder "Active".
 */
async function rollTable()
{
  for (let i=0; i< count; i++)
    {
      if(tableName ==="")
      tableName = "Wald";
      await game.tables.getName(tableName).draw({rollMode:"selfroll"});
    }
}

rollTable();