<template>
	<div>
		<el-row
			class="paginator-container"
			:gutter="10">
			<el-col
				class="form-container"
				:xs="16" :sm="12" :md="14" :lg="14" :xl="14">
				<el-form
					@submit.prevent
					label-width="120px"
					:label-position="labelPosition"
				>
					<el-form-item
						label="Position"
					>
					{{ posStr }}
					</el-form-item>
					<el-form-item
						label="Page number"
					>
						<el-input
							v-model="pageNumber"
							placeholder="Page number"
							@change="onPagenumberInput"
							clearable
							:disabled="!isIndexValid"
						/>
					</el-form-item>
				</el-form>
			</el-col>
			<el-col
				class="pagelist-area-container"
				:xs="8" :sm="12" :md="10" :lg="10" :xl="10">
				<el-input
					v-model="pageListTag"
					readonly
					:rows="5"
					type="textarea"
					placeholder="No pagelist yet..."
					v-bind:class="{ isComplete }"
					@click="copyPagelistTag"
				/>
				<el-button
					size=mini
					:icon="CopyDocument"
				>
					Copy pagelist
				</el-button>
			</el-col>
		</el-row>
		<el-row class="suggested-numbers">
			<el-button
				v-for="option in quickOptions"
				:key="option.value"
				@click="onPagenumberInput( option.value )"
			>
				{{ option.value }}
			</el-button>
		</el-row>
	</div>
</template>
<script>
import { ref, defineComponent } from 'vue';
import { CopyDocument } from '@element-plus/icons-vue';
import { ElMessageBox, ElMessage } from 'element-plus';

import { Paginator } from '../paginator.js';
import { mapState, mapGetters } from 'vuex';

export default defineComponent( {
	name: 'PageViewer',
	computed: {
		...mapState( {
			indexName: ( state ) => state.index.name,
			isComplete: ( state ) => state.paginationProcess.complete,
			currentPage: ( state ) => state.paginationProcess.currentPage
		} ),
		...mapGetters( {
			narrow: 'isNarrow'
		} ),
		isIndexValid() {
			const state = this.$store.state;
			return state.index.name &&
				!state.paginationProcess.complete;
		}
	},
	watch: {
		indexName( newVal ) {
			console.log( `Index changed, remaking pagination: ${newVal}` );

			if ( !newVal ) {
				this.posStr = '—';
				this.paginator = null;
				return;
			}
			this.paginator = new Paginator(
				this.$store.state.paginationProcess.totalPages
			);
			this.askQuestion();
		},
		isComplete() {
			this.posStr = this.getNewPosStr();
		},
		currentPage() {
			this.posStr = this.getNewPosStr();
		},
		narrow: {
			handler( val ) {
				// this.labelPosition = val ? 'top' : 'right';
				this.labelPosition = 'right';
			},
			immediate: true
		}
	},
	methods: {
		onPagenumberInput( pagenumber ) {
			if ( !this.paginator || !pagenumber ) {
				return;
			}

			// Send the pagination to the lib
			this.paginator.addAnswer(
				this.$store.state.paginationProcess.currentPage,
				pagenumber
			);

			// Get the next question
			this.askQuestion();

			this.pageListTag = this.paginator.pagelist.toTag();
			this.pageNumber = '';

			this.$store.dispatch( 'setComplete', this.paginator.isComplete() );
		},
		askQuestion() {
			const q = this.paginator.nextQuestion();

			if ( q ) {
				this.$store.dispatch( 'changeCurrentPage', q.position );

				this.quickOptions = q.proposals.map( ( p ) => {
					return {
						value: p
					};
				} );

				this.$store.dispatch( 'suggestPageLoads', q.suggestedPositions );
			}

			const complete = this.paginator.isComplete();

			this.$store.dispatch( 'setComplete', complete );
			if ( complete ) {
				this.alertComplete();
			}
			this.posStr = this.getNewPosStr();
		},
		getNewPosStr() {
			if ( this.$store.state.paginationProcess.complete ) {
				return 'Complete!';
			}

			return `${this.$store.state.paginationProcess.currentPage } of ` +
				`${this.$store.state.paginationProcess.totalPages }`;
		},
		indexReady() {
			this.askQuestion();
			this.posStr = this.getNewPosStr();
		},
		copyPagelistTag() {
			navigator.clipboard.writeText( this.pageListTag );
		},
		alertComplete() {
			ElMessageBox.confirm(
				'The pagelist has been completed. 🎉',
				'Complete',
				{
					confirmButtonText: 'Copy pagelist',
					cancelButtonText: 'Cancel',
					type: 'success'
				}
			)
				.then( () => {
					this.copyPagelistTag();
					ElMessage( {
						type: 'success',
						message: 'Pagelist copied'
					} );
				} );
		}
	},
	setup() {
		let position = ref( 1 );
		let pageNumber = ref( '' );
		let pageListTag = ref( '<pagelist/>' );
		let posStr = ref( '—' );
		let quickOptions = ref( [] );

		return {
			CopyDocument,
			labelPosition: ref( 'right' ),
			paginator: null,
			posStr,
			quickOptions,
			position,
			pageNumber,
			pageListTag
		};
	}
} );
</script>
<style>

.paginator-container {
	align-items: end;
}

.pagelist-area-container {
	margin-bottom: 5px;
}

.isComplete textarea {
	border-color: green;
}

.suggested-numbers {
	justify-content: center;
}

</style>
