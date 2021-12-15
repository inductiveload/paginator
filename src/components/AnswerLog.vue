<template>
	<div class="answer-log">
		<p>
			This is the list of the answers given so far. Include these with any
			bug report for mistaken page numbering, along with the filename.
		</p>

		<el-tabs
			v-model="activeTab"
		>
			<el-tab-pane label="Table" name="table">
				Index: {{ data.index }}
				<el-table
					:data="data.answers"
					style="width: 100%"
				>
					<el-table-column prop="position" label="Position in index" />
					<el-table-column prop="value" label="Name" />
				</el-table>
			</el-tab-pane>
			<el-tab-pane label="Text" name="text">
				<el-input
					v-model="asText"
					autosize
					readonly
					type="textarea"
				/>
			</el-tab-pane>
		</el-tabs>
	</div>
</template>
<script>

import { defineComponent, ref } from 'vue';

export default defineComponent( {
	name: 'AnswerLog',
	props: {
		data: {
			type: Object,
			required: true
		}
	},
	computed: {
		asText() {
			let s = `Index: ${this.data.index}\n`;
			s += `Wikisource: ${this.data.wikisource}\n\n`;
			for ( const answer of this.data.answers ) {
				s += `${answer.position}\t${answer.value}\n`;
			}
			return s;
		}
	},
	setup() {
		return {
			activeTab: ref( 'text' )
		};
	}
} );
</script>
<style scoped>

.answer-log {
	word-break: normal;
}
</style>
