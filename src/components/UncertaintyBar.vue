<template>
  <svg
    :class="$style.completionbar"
    :height="height"
  >
    <path
      :fill="data.total > 0 ? 'grey' : 'transparent'"
      :style="{transform: `translate(${getXAsPercent( ( data.current || 1 ) - 0.5 )}%, 0)`}"
      :d="`M-3 ${height} H 3 L 0 ${height - 4} Z`"
    />
    <g
    >
      <rect
        width="100%"
        :height="height - 4"
        :fill="data.total > 0 ? data.background : 'transparent'"
      />
      <g
        v-for="(item, i) in data.children"
        :key="i"
        :class="$style.item"
        :style="{transform: `translate(${getXAsPercent( item.x - 1 )}%, 0)`}"
      >
        <rect
          :class="$style.rect"
          :width="getXAsPercent( item.width ) + '%'"
          :height="height - 4"
          :fill="item.data.color"
        />
      </g>
    </g>
  </svg>
</template>

<script>
export default {
	props: {
		data: {
			type: Object,
			required: true
		},
		height: {
			type: Number,
			required: true
		},
		width: {
			type: Number,
			required: true
		}
	},
	methods: {
		getXAsPercent( x ) {
			return 100 * ( x ) / ( this.data.total );
		}
	}
};
</script>

<style module>
.completionbar {
  width: calc( 100% - 10px );
  padding: 0 5px;
  display: block;
  overflow: visible
}
</style>
