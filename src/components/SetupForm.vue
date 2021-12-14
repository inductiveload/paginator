<template>
	<div>
		<el-form
			class="setup-form"
			@submit.prevent
			label-width="120px"
			label-position="right"
			:inline="false"
		>
			<el-form-item
				label="Wikisource"
				label-position="top"
			>
				<el-select
					v-model="theWikisource"
					@change="updateWikisource"
					placeholder="Enter Wikisource subdomain"
					title="Enter Wikisource subdomain"
				>
					<el-option
						v-for="item in wikisources"
						:key="item.value"
						:label="item.value"
						:value="item.value"
					>
					</el-option>
				</el-select>
			</el-form-item>
			<el-form-item
				label="Index"
				class="index-input-container"
			>
				<el-autocomplete
					class="index-input"
					v-model="theIndexName"
					@change="changeIndexName"
					@select="selectIndexName"
					clearable
					:fetch-suggestions="querySearch"
					placeholder="Please enter an index"
				>
					<template  size="mini" #append>
						<el-button
							size="mini"
							:icon="TopRight"
							@click="openIndex"
							title="Visit on Wikisource"
						/>
					</template>
				</el-autocomplete>
			</el-form-item>
		</el-form>
	</div>
</template>
<script>

import { ref, defineComponent } from 'vue';
import { mapState, mapGetters } from 'vuex';
import { TopRight, Search } from '@element-plus/icons-vue';
import { getIndexesWithPrefix, getIndexName } from '@/mw_utils.js';

export default defineComponent( {
	name: 'SetupForm',
	computed: {
		...mapState( {
			indexName: state => state.index.name,
			wikisource: state => state.wikisource
		} ),
		...mapGetters( {
			narrow: 'isNarrow'
		} )
	},
	watch: {
		indexName( val ) {
			this.theIndexName = val;
		},
		wikisource( val ) {
			this.theWikisource = val;
		},
		narrow: {
			handler: function ( val ) {
				this.labelPosition = val ? 'top' : 'right';
			},
			immediate: true
		}
	},
	methods: {
		selectIndexName( event ) {
			this.changeIndexName( event.value );
		},
		changeIndexName( indexName ) {
			this.$store.dispatch( 'changeIndex', indexName );
		},
		updateWikisource( value ) {
			this.$store.dispatch( 'setWikisource', value );
		},
		querySearch( query, cb ) {
			const domain = this.$store.state.wikisource;
			getIndexesWithPrefix( domain, query )
				.then( ( apiVals ) => {
					const values = apiVals.map( ( v ) => {
						return {
							value: v.title.replace( /^[^ :]+:/, '' )
						};
					} );

					cb( values );
				} );
		},
		openIndex() {

			const indexName = this.$store.state.index.name;

			if ( !indexName ) {
				return;
			}

			const url = getIndexName(
				this.$store.state.wikisource,
				indexName );

			window.open( url );
		},
		lookupIndex() {
			console.log( 'Looking up index' );
			this.lookupIndexDialogVisible = true;
		}
	},
	setup() {

		const wikisourceDomains = [
			'en', 'mul', 'ar', 'as', 'be', 'bn', 'br', 'ca', 'cy', 'da',
			'de', 'el', 'eo', 'es', 'et', 'fa', 'fr', 'gu', 'he', 'hr',
			'hu', 'hy', 'id', 'it', 'kn', 'la', 'ml', 'mr', 'nl', 'no',
			'pl', 'pms', 'pt', 'ro', 'ru', 'sa', 'sl', 'sv', 'te', 'vec', 'vi', 'zh'
		];

		const wikisources = ref( wikisourceDomains.map( ( ws ) => {
			return {
				value: ws
			};
		} ) );

		return {
			theIndexName: ref( '' ),
			theWikisource: ref( '' ),
			labelPosition: ref( 'right' ),
			lookupIndexDialogVisible: ref( false ),
			wikisources,
			TopRight,
			Search
		};
	}
} );
</script>

<style>
.index-input {
	width: 100%;
}

.index-input-container {
	max-width: calc( 100% - 10px );
	width: 40em;
}

.el-form-item {
	margin-bottom: 8px;
}
</style>
