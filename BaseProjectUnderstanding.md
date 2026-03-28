Before Implementing any Changes Read the Project and its files, Take a good look around related Files and Folder Structure to gather Context and resulting in better,cleaner and more suiting code.
Carefully plan actions and steps to achive the objective, and then clearly and cleanly go throug that plan. 
This is a Next JS 16 Project
We are wokring with app router and mainly focuesd on SSR and SSG
We are mainly focusing on using shadcn ui for the ui components
We are using tailwind css for the styling
We are using lucide icons for the icons
When ever imlpementing any kind of UI make sure to take a good look at the other compnoents/screens/pages and try to implement the same style and structure. Its should be visualy simmiler and consistent.

Global Input Box Standard (Applied Project-Wide)
- Use shared Input component from components/ui/input.jsx for all text-like input boxes.
- Core input box metrics:
	- Border radius: 6px
	- Horizontal padding: 14px
	- Vertical padding: 10px
	- Icon gap inside input groups: 8px
	- Label to input spacing target: 10px
- Tokens are defined in app/globals.css:
	- --input-box-radius
	- --input-box-padding-x
	- --input-box-padding-y
	- --input-box-icon-gap
	- --input-box-label-gap
- Implementation notes:
	- Base Input primitive enforces these metrics globally for all Input usages.
	- Search input icon offsets and inner paddings are tokenized from these variables.
	- Custom email input-group in vault access control is also token-aligned.
- Exception: range sliders (type="range") are not treated as input boxes and keep their own sizing/styling.