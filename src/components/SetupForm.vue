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
					@select="selectIndexName"
					clearable
					:fetch-suggestions="querySearch"
					placeholder="Please enter an index"
				>
					<template  size="mini" #append>
						<el-popover
							:disabled="theIndexName"
							placement="bottom"
							:width="200"
							trigger="click"
						>
							<el-link
								:href="openIndex"
								target="_blank"
							>
								View
							</el-link>
							|
							<el-link
								:href="openIndex + '?action=edit'"
								target="_blank"
							>
								Edit index
							</el-link>
							<template #reference>
								<el-button
									size="mini"
									:icon="TopRight"
									title="Index page at Wikisource"
								/>
							</template>
						</el-popover>
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
import { wikisourceDomains } from '@/ws_data.js';

export default defineComponent( {
	name: 'SetupForm',
	computed: {
		...mapState( {
			indexName: state => state.index.name,
			wikisource: state => state.wikisource
		} ),
		...mapGetters( {
			narrow: 'isNarrow'
		} ),
		openIndex() {

			const indexName = this.$store.state.index.name;

			if ( !indexName ) {
				return;
			}

			let url = getIndexName(
				this.$store.state.wikisource,
				indexName );
			return url;
		}
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
		// strip namespace, spaces, etc
		normaliseIndex( name ) {
			return name
				.replace( /^[^ :]+:/, '' )
				.replace( /_/g, ' ' );
		},
		querySearch( query, cb ) {
			const domain = this.$store.state.wikisource;
			const currIndex = this.$store.state.index.name;

			// if dropping down with the current index in place, proposed the "empty list"
			// defaults for choosing a new index
			if ( query && currIndex &&
				this.normaliseIndex( query ) === this.normaliseIndex( currIndex ) ) {
				query = '';
			}

			getIndexesWithPrefix( domain, query )
				.then( ( apiVals ) => {
					const values = apiVals.map( ( v ) => {
						return {
							value: this.normaliseIndex( v.title )
						};
					} );

					cb( values );
				} );
		},
		lookupIndex() {
			console.log( 'Looking up index' );
			this.lookupIndexDialogVisible = true;
		}
	},
	setup() {

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
