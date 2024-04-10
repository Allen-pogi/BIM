// Import necessary libraries and modules
import * as OBC from "openbim-components"
import * as WEBIFC from "web-ifc"
import { FragmentsGroup } from 'bim-fragment';

// Define a custom type for Quantification results
type QtoResult = { [setName: string]: { [qtoName: string]: number } }

// Define a class SimpleQTO which extends from OBC.Component
export class SimpleQTO extends OBC.Component<QtoResult> implements OBC.UI, OBC.Disposable {
    // Static property to hold a universally unique identifier for this component
    static uuid = "7ec21568-e809-4392-a810-50b16b3777c4"
    
    // Instance property to track if the component is enabled
    enabled = true
    
    // Private properties to hold references to other components and the quantification results
    private _components: OBC.Components
    private _qtoResult: QtoResult = {}
    
    // UI element for this component
    uiElement = new OBC.UIElement<{
        activationBtn: OBC.Button
        qtoList: OBC.FloatingWindow
    }>()

    // Constructor for SimpleQTO class
    constructor(components: OBC.Components) {
        super(components)
        this._components = components
        this.setUI() // Set up the user interface
        components.tools.add(SimpleQTO.uuid, this) // Add this component to the tools
    }

    // Asynchronous setup method
    async setup() {
        // Get FragmentHighlighter tool from components
        const highlighter = await this._components.tools.get(OBC.FragmentHighlighter)
        // Add event listener for when fragments are highlighted
        highlighter.events.select.onHighlight.add((fragmentIdMap) => {
            this.sumQuantities(fragmentIdMap) // Sum quantities when fragments are highlighted
        })
        // Add event listener for when highlights are cleared
        highlighter.events.select.onClear.add(() => {
            this.resetQuantities() // Reset quantities when highlights are cleared
        })
    }

    // Method to reset quantities
    resetQuantities() {
        this._qtoResult = {}
    }

    // Method to set up the UI elements
    private setUI() {
        // Create activation button
        const activationBtn = new OBC.Button(this._components)
        activationBtn.materialIcon = "functions"

        // Create floating window for displaying quantification results
        const qtoList = new OBC.FloatingWindow(this._components)
        qtoList.title = "Quantification"
        this._components.ui.add(qtoList)
        qtoList.visible = false // Initially hide the floating window

        // Add click event handler for activation button
        activationBtn.onClick.add(() => {
            activationBtn.active = !activationBtn.active
            qtoList.visible = activationBtn.active // Show/hide the floating window based on button state
        })

        this.uiElement.set({ activationBtn, qtoList }) // Set the UI elements
    }

    // Method to update the UI with quantification results
    async updateQtoUI() {
        const qtoList = this.uiElement.get("qtoList")
        await qtoList.slots.content.dispose(true) // Dispose existing content of the floating window
        const qtoTemplate = `
            <div>
            <p id="qto" style="color: rgb(180, 180, 180)"}>Sample: 0</p>
            </div>
        `
        // Loop through quantification results and populate the UI
        for (const setName in this._qtoResult) {
            const qtoGroup = new OBC.TreeView(this._components)
            qtoGroup.slots.content.get().style.rowGap = "4px"
            qtoGroup.title = setName
            qtoList.addChild(qtoGroup)
            const qtos = this._qtoResult[setName]
            for (const qtoName in qtos) {
              const value = qtos[qtoName]
              const ui = new OBC.SimpleUIComponent(this._components, qtoTemplate)
              ui.get().style.display = "flex"
              const qtoElement = ui.getInnerElement("qto") as HTMLParagraphElement
              qtoElement.textContent = `${qtoName}: ${value.toFixed(2)}`
              qtoGroup.addChild(ui)
            }
        }
    }

    // Method to sum quantities based on highlighted fragments
    async sumQuantities(fragmentIdMap: OBC.FragmentIdMap) {
        // Get FragmentManager and IfcPropertiesProcessor tools from components
        const fragmentManager = await this._components.tools.get(OBC.FragmentManager)
        const propertiesProcessor = await this._components.tools.get(OBC.IfcPropertiesProcessor)
        // Iterate through highlighted fragments
        for (const fragmentID in fragmentIdMap) {
            const fragment = fragmentManager.list[fragmentID]
            const model = fragment.mesh.parent
            // Check if the model is a FragmentsGroup and has properties
            if (!(model instanceof FragmentsGroup && model.properties)) { continue }
            const properties = model.properties
            const modelIndexMap = propertiesProcessor.get()[model.uuid]
            if (!modelIndexMap) { continue }
            const expressIDs = fragmentIdMap[fragmentID]
            // Iterate through entities in the fragments
            for (const expressID of expressIDs) {
                const entityMap = modelIndexMap[Number(expressID)]
                if (!entityMap) { continue }
                for (const mapID of entityMap) {
                    const entity = properties[mapID]
                    const { name: setName } = OBC.IfcPropertiesUtils.getEntityName(properties, mapID)
                    // Check if the entity is an IFCELEMENTQUANTITY and has a name
                    if (!(entity.type === WEBIFC.IFCELEMENTQUANTITY && setName)) { continue }
                    // Initialize quantification result if not already present
                    if (!(setName in this._qtoResult)) { this._qtoResult[setName] = {} }
                    
                    // Call a utility function to get quantities associated with an entity from the properties
                    OBC.IfcPropertiesUtils.getQsetQuantities(
                    properties, // Pass the properties object containing entity information
                    mapID, // Pass the ID of the entity for which quantities are being fetched
                    (qtoID) => { // Provide a callback function to handle quantities associated with the entity
                    // Extract the name of the quantity (QTO) from its ID
                    const { name: qtoName } = OBC.IfcPropertiesUtils.getEntityName(properties, qtoID)
                    // Extract the numerical value of the quantity
                    const { value } = OBC.IfcPropertiesUtils.getQuantityValue(properties, qtoID)
                    // Check if both the name and value of the quantity are valid
                    if (!(qtoName && value)) { return } // If not, exit the callback function
                    // Initialize the quantity result if it doesn't exist already
                    if (!(qtoName in this._qtoResult[setName])) { this._qtoResult[setName][qtoName] = 0 }
                    // Add the value of the quantity to the existing quantity result
                    this._qtoResult[setName][qtoName] += value
                        }
                    )
                }
            }
        }
        await this.updateQtoUI() // Update the UI after summing quantities
    }

    // Asynchronous method to dispose of the component
    async dispose() {
        // Get FragmentHighlighter tool from components
        const highlighter = await this._components.tools.get(OBC.FragmentHighlighter)
        // Remove event listener for summing quantities on highlight
        highlighter.events.select.onHighlight.remove(this.sumQuantities)
        this.uiElement.dispose() // Dispose UI elements
        this.resetQto() // Reset quantities before disposing
    }

    // Method to reset quantification results
    resetQto() {
        this._qtoResult = {}
        const qtoWindow = this.uiElement.get("qtoList")
        qtoWindow.slots.content.dispose(true) // Dispose content of the floating window
      }

    // Getter method to retrieve quantification results
    get(): QtoResult {
        return this._qtoResult
    }
}
