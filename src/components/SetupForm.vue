<template>
	<div>
		<el-form
			@submit.prevent
			label-width="120px"
		>
			<el-form-item
				label="Index"
			>
				<el-autocomplete
					class="index-input"
					v-model="theIndexName"
					clearable
					@change="updateIndexName"
					@select="updateIndexName"
					:fetch-suggestions="querySearch"
					placeholder="Please enter an index"
				/>
			</el-form-item>
		</el-form>
	</div>
</template>
<script>
import { ref, defineComponent } from 'vue';
import { mapState } from 'vuex';
import { getIndexesWithPrefix } from '../mw_utils.js';

export default defineComponent( {
	name: 'PageViewer',
	computed: {
		...mapState( {
			indexName: state => state.index.name
		} )
	},
	watch: {
		indexName( val ) {
			this.theIndexName = val;
		}
	},
	methods: {
		updateIndexName( event ) {
			this.$store.dispatch( 'changeIndex', event.value );
		}
	},
	setup() {
		async function querySearch( query, cb ) {

			const apiVals = await getIndexesWithPrefix( query );

			const values = apiVals.map( ( v ) => {
				return {
					value: v.title.replace( /^[^:]+:/, '' )
				};
			} );

			cb( values );
		}

		return {
			theIndexName: ref( '' ),
			querySearch
		};
	},
	mounted() {
	}
} );
</script>
<style>
.index-input {
	width: 100%;
}
</style>
