<template>
	<div class="about-container">
		<Markdown :source="`
## About this tool

The Wikisource Page Game is a tool that permits building a page list in an interactive way,
without needing to manually scrub through a file checking for page numbering breaks and
doing a lot of mental arithemtic.

### How to use it

1. Select your Wikisource from the drop down (this will inform the tool about where to check for
	indexes that need work and other language-specific things).
1. Choose your index: enter the name and choose from the drop-down.
	If the Wikisource has a known 'indexes to check' category, items from there will be shown
	at first.
1. The first page of the file will be loaded into the viewer.
1. Enter the page number for this page into the 'Page number' input, or select one of the
	suggested values below it.
1. The tool will then choose another page. It will try to choose pages so that you need to
	answer as few questions as possible — continue identifying page numbers until the pagelist
	is complete.
1. The red and blue 'completeness indicator' shows which page ranges in the file are still
	uncertain. The pagelist is complete when no red segments remain.
1. When complete, you will be prompted to copy the pagelist, which you can insert into
	the index page at Wikisource.

### Special features

* If you enter '-', it will be replaced with '–'
* Use '?' to indicate that the page probably is numbered, but you do not know the number.
	If a preceding or following page range has numbers, it will be extended to include this
	range later.

## Code and bugs

* The code for this tool can be found at [Github][1]
* Bugs and feature requests can be filed at [Phabricator][2] (prefix your issue with 'Page Game')
  * In particular, please _do_ file issues for Wikisource domain-specific things
	like useful suggested page numbers in your language (e.g. in English: 'Cover', 'Img', etc.).
  * If a particular file is causing trouble, please provide the file name, as well as the sequence
	of page number inputs that caused the problem.
* This tool is MIT licensed.

[1]: https://github.com/inductiveload/paginator.git
[2]: https://phabricator.wikimedia.org/project/board/5221/
`" />
	</div>
</template>

<script>
import Markdown from 'vue3-markdown-it';

export default {
	name: 'About',
	components: {
		Markdown
	},
	data() {
		return {
		};
	}
};
</script>

<style scoped>
.about-container {
	margin: 0 auto;
	max-width: 45em;
}
</style>
