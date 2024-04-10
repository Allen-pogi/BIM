// Import necessary libraries and modules
import * as OBC from "openbim-components"

// Define a class for UI component for To Do cards
export class ToDoCard extends OBC.SimpleUIComponent {

  // Event to trigger what happens once the delete button is clicked
  onCardDeleteClick = new OBC.Event()

  // Event to trigger what happens once the card is clicked
  onCardClick = new OBC.Event()

  // Define types of slots to use
  slots: {
    actionButtons: OBC.SimpleUIComponent
  }
  
  // Setter for description property, updates the description element in the card
  set description(value: string) {
    const descriptionElement = this.getInnerElement("description") as HTMLParagraphElement
    descriptionElement.textContent = value
  }

  // Setter for date property, updates the date element in the card
  set date(value: Date) {
    const dateElement = this.getInnerElement("date") as HTMLParagraphElement
    dateElement.textContent = value.toDateString()
  }

  // Constructor to create the ToDoCard UI component
  constructor(components: OBC.Components) {
    // HTML template to create the card with dynamic data through IDs
    const template = `
    <div class="todo-item">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; column-gap: 15px; align-items: center;">
          <span class="material-icons-round" style="padding: 10px; background-color: #686868; border-radius: 10px;">construction</span>
          <div>
            <p id="description">Make anything here as you want, even something longer.</p>
            <p id="date" style="text-wrap: nowrap; color: #a9a9a9; font-size: var(--font-sm)">Fri, 20 Sep</p>
          </div>
        </div>
        <div data-tooeen-slot="actionButtons"></div>
      </div>
    </div>
    `
    // Call the constructor of the parent class and pass the components and template
    super(components, template)

    // Get the card element
    const cardElement = this.get()

    // Event listener for the card click event
    cardElement.addEventListener("click", () => { 
      this.onCardClick.trigger() // Trigger the onCardClick event when the card is clicked
    })

    // Replace the slot placeholder with a delete button UI component
    this.setSlot("actionButtons", new OBC.SimpleUIComponent(this._components))
    const deleteBtn = new OBC.Button(this._components)
    deleteBtn.materialIcon = "delete" // Set the material icon for the delete button
    this.slots.actionButtons.addChild(deleteBtn) // Add the delete button to the action buttons slot

    // Event listener for the delete button click event
    deleteBtn.onClick.add(() => {
      this.onCardDeleteClick.trigger() // Trigger the onCardDeleteClick event when the delete button is clicked
    })
  }
}
