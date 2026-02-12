you missed some things you should have handled
1- the current settings sheet has a bad layout where it has the first setting row "Data" setting too close to the header almost flush with it — Solved
2- as a whole layout is not designed well for a sheet — Solved
3- then for import and export they show the elements of selectable (checkboxes) and items to export or import in a very bad style and container — Solved
4- placement of buttons is so bad — Solved
5- import and export experience is not unified and has various UI/UX differences — Solved
6- in addition to all the previous mistakes, the sheets are not responsive on mobiles, all of them, importing result breakes the layout, and there's no way for users to close the file they opened to import, and closing the import sheet does not reset state, — Solved
7- settings sheet is not responsive — Solved
8- the sonner appears on the sheet body, so should we make the sonner position in the middle of the screen? (this is a global change) — Solved
9- importing has no loading state, does not show "Importing..." — Solved
10- settings sheet is totally not suitable for mobile devices! — Solved
11- on mobile devices, import, export, and maintenance are not scrollable — Solved
12- impor preview shows skip duplicates and override duplicates not resposnive and exceed their container therefore rename them to just Skip and Override, this is global not just mobile — Solved

your task now is to entirely refactor the sheet component from scratch, make it a single reusable component for consistent styling and mobile responsivness, extract all shared UI to a single reusable components

YOU MUST FOLLOW:
1- @building-bulletproof-react-components.md
2- @engineering-standards.md
3- @react-performance-standards.md
