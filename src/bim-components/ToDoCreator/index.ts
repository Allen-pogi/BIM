// Import necessary libraries and modules
import * as OBC from "openbim-components"
import * as THREE from "three"
import { ToDoCard } from "./src/ToDoCard" // Import ToDoCard class from another file

// Custom datatype for priority property
type ToDoPriority = "Low" | "Medium" | "High"

// Interface to define the properties of each To Do
interface ToDo {
    description: string
    date: Date
    fragmentMap: OBC.FragmentIdMap
    camera: {position: THREE.Vector3, target: THREE.Vector3}
    priority: ToDoPriority
}

// Create and export a class named ToDoCreator, all tools must extend from the Component class
export class ToDoCreator extends OBC.Component<ToDo[]> implements OBC.UI, OBC.Disposable {
    static uuid = "be178b9a-0ee1-4d3d-b83a-49d4c5f3e34b" // Unique identifier for the ToDoCreator tool

    // Event to trigger when a new To Do is created
    onProjectCreated = new OBC.Event<ToDo>()

    enabled = true // Flag to indicate if the tool is enabled
    uiElement = new OBC.UIElement<{ // Specify all UI elements to use
        activationButton: OBC.Button
        toDoList: OBC.FloatingWindow
    }>()

    private _components: OBC.Components // Reference to components
    private _list: ToDo[] = [] // List to store To Do items

    // Constructor to initialize the ToDoCreator tool
    constructor(components: OBC.Components) {
        super(components) // Call the constructor of the parent class
        this._components = components // Initialize _components
        components.tools.add(ToDoCreator.uuid, this) // Add the ToDoCreator tool to the tools list
        this.setUI() // Initialize the user interface
    }

    // Dispose method to clean up resources when the tool is disposed
    async dispose() {
        this.uiElement.dispose() // Dispose UI elements
        this._list = [] // Clear the list of To Do items
        this.enabled = false // Disable the tool
    }

    // Setup method to set up the tool, could have been added to the constructor
    async setup() {
        // Add materials for highlighting based on priority
        const highlighter = await this._components.tools.get(OBC.FragmentHighlighter)
        highlighter.add(`${ToDoCreator.uuid}-priority-Low`, [new THREE.MeshStandardMaterial({color: 0x59bc59})])
        highlighter.add(`${ToDoCreator.uuid}-priority-Normal`, [new THREE.MeshStandardMaterial({color: 0x597cff})])
        highlighter.add(`${ToDoCreator.uuid}-priority-High`, [new THREE.MeshStandardMaterial({color: 0xff7676})])
    }

    // Method to create a new To Do item
    async addToDo(description: string, priority: ToDoPriority) {
        if(!this.enabled) {return} // If tool is disabled, exit

        // Get camera position and target
        const camera = this._components.camera
        if (!(camera instanceof OBC.OrthoPerspectiveCamera)) {
            throw new Error("ToDoCreator needs the OrthoPerspectiveCamera in order to work")
        }
        const position = new THREE.Vector3()
        camera.controls.getPosition(position)
        const target = new THREE.Vector3()
        camera.controls.getTarget(target)
        const toDoCamera = {position, target}

        // Get highlighter tool
        const highlighter = await this._components.tools.get(OBC.FragmentHighlighter)

        // Create a new To Do item
        const toDo: ToDo = {
            camera: toDoCamera,
            description,
            date: new Date(),
            fragmentMap: highlighter.selection.select,
            priority
        }

        this._list.push(toDo) // Add the new To Do item to the list

        // Create a new ToDoCard UI element and add it to the To Do list
        const toDoCard = new ToDoCard(this._components)
        toDoCard.description = toDo.description
        toDoCard.date = toDo.date
        toDoCard.onCardClick.add(() => {
            // Change the camera angle when the card is clicked
            camera.controls.setLookAt(
                toDo.camera.position.x,
                toDo.camera.position.y,
                toDo.camera.position.z,
                toDo.camera.target.x,
                toDo.camera.target.y,
                toDo.camera.target.z,
                true
            )
            // Highlight the elements related to the To Do item
            const fragmentMapLenght = Object.keys(toDo.fragmentMap).length
            if (fragmentMapLenght === 0) {return}
            highlighter.highlightByID("select", toDo.fragmentMap)
        })

        const toDoList = this.uiElement.get("toDoList")
        toDoList.addChild(toDoCard)

        toDoCard.onCardDeleteClick.add(() => {
            this.deleteToDo(toDo, toDoCard) // Delete the To Do item
        })

        this.onProjectCreated.trigger(toDo) // Trigger the onProjectCreated event
    }

    // Method to delete a To Do item
    deleteToDo(toDo: ToDo, toDoCard: ToDoCard) {
        // Remove the To Do item from the list
        const updateToDoList = this._list.filter((toDo) => {
            return(toDo.description!=toDo.description)
        })
        this._list = updateToDoList

        // Dispose the To Do UI element
        toDoCard.dispose()
    }

    // Method to define UI elements for the tool
    private async setUI() {

        // Activation button UI definition
        const activationButton = new OBC.Button(this._components)
        activationButton.materialIcon = "construction"

        const newToDoBtn = new OBC.Button(this._components, {name: "Create"})
        activationButton.addChild(newToDoBtn)
        
        // New To Do form definition
        const form = new OBC.Modal(this._components)
        this._components.ui.add(form)
        form.title = "Create New To Do"
        const descriptionInput = new OBC.TextArea(this._components)
        descriptionInput.label = "Description"
        form.slots.content.addChild(descriptionInput)
        // Priority dropdown added to the form
        const priorityDropdown = new OBC.Dropdown(this._components)
        priorityDropdown.label = "Priority"
        priorityDropdown.addOption("Low", "Normal", "High")
        priorityDropdown.value = "Normal"
        form.slots.content.addChild(priorityDropdown)

        form.slots.content.get().style.padding = "20px"
        form.slots.content.get().style.display = "flex"
        form.slots.content.get().style.flexDirection = "column"
        form.slots.content.get().style.rowGap = "20px"

        // Buttons functionality
        form.onAccept.add(() => {
            this.addToDo(descriptionInput.value, priorityDropdown.value as ToDoPriority)
            descriptionInput.value = ""
            form.visible = false
        })
        form.onCancel.add(() => form.visible = false)
        newToDoBtn.onClick.add(() => form.visible = true)
        
        // List window UI definition
        const toDoList = new OBC.FloatingWindow(this._components)
        this._components.ui.add(toDoList)
        toDoList.visible = false
        toDoList.title = "To Do List" 

        // Toolbar added to the top of the to do list, to add the colorize button
        const toDoListToolbar = new OBC.SimpleUIComponent(this._components)
        toDoList.addChild(toDoListToolbar)
        const colorizeBtn = new OBC.Button(this._components)
        colorizeBtn.materialIcon = "format_color_fill"
        toDoListToolbar.addChild(colorizeBtn)

        // Logic of clicking colorize button, for clicking and unclicking
        const highlighter = await this._components.tools.get(OBC.FragmentHighlighter)
        colorizeBtn.onClick.add(() => {
            colorizeBtn.active = !colorizeBtn.active
            if (colorizeBtn.active) {
                for (const toDo of this._list) {
                    const fragmentMapLenght = Object.keys(toDo.fragmentMap).length
                    if(fragmentMapLenght === 0) {return}
                    highlighter.highlightByID(`${ToDoCreator.uuid}-priority-${toDo.priority}`, toDo.fragmentMap)
                }
            } else {
                highlighter.clear(`${ToDoCreator.uuid}-priority-Low`)
                highlighter.clear(`${ToDoCreator.uuid}-priority-Normal`)
                highlighter.clear(`${ToDoCreator.uuid}-priority-High`)
            }
        })
        
        const toDoListBtn = new OBC.Button(this._components, {name: "List"})
        activationButton.addChild(toDoListBtn)
        toDoListBtn.onClick.add(() => toDoList.visible = !toDoList.visible)

        // Set the created elements as actual values of the UI components for this tool 
        this.uiElement.set({activationButton, toDoList})
    }

    // Getter method to retrieve the list of To Do items
    get(): ToDo[] {
        return this._list
    }
}
