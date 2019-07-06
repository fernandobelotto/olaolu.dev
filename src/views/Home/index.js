import {
  SECTIONS,
  NAVIGATION_ID,
  SECTION_SELECTOR,
  CURRENT_SECTION_KEY,
} from '@/constants'
import {
  wait,
  toPx,
  resetScroll,
  getEventPath,
  matchesQuery,
} from '@mrolaolu/helpers'
import Vue from 'vue'
import './home-styles'
import { mapState } from 'vuex'
import Contact from './Contact'
import PitchSlate from './PitchSlate'
import Experience from './Experience'
import Cornerstone from './Cornerstone'
import Carriageway from './Carriageway'
import { goToSection, breakpoints } from '@/helpers'

const maybeMediumScreen = () =>
  matchesQuery(`(max-width: ${toPx(breakpoints.medium)})`)

const Homepage = Vue.component('Homepage', {
  data: () => ({
    touchY: null,
    prevTime: new Date().getTime(),
    isMediumScreen: maybeMediumScreen(),
  }),

  computed: {
    ...mapState([CURRENT_SECTION_KEY]),
  },

  mounted() {
    const { documentElement } = document
    const sections = Array.from(document.querySelectorAll(SECTION_SELECTOR))

    !this.isMediumScreen &&
      wait(1, () => {
        // Set current section to currently visible section upon reload
        const sectionInView = sections.find(
          section => this.getSectionOffsetDiffFromViewport(section) < 2 // <2%
        )

        if (!sectionInView) wait(100, () => resetScroll())
        else {
          goToSection([sectionInView])
          const firstSection = this[CURRENT_SECTION_KEY] === SECTIONS[0]
          if (!firstSection) this.$store.commit('headerCompact', true)
        }
      })

    // Set current section to the first section by default.
    this.$root.$el.dataset[CURRENT_SECTION_KEY] = this.getCurrentSectionId()

    window.addEventListener('resize', this.recalcSection)
    document.addEventListener('keydown', this.maybeScrollJack)
    document.addEventListener('touchstart', this.handleTouchstart)
    document.addEventListener('touchmove', this.handleTouchmove, {
      passive: false,
    })
    documentElement.addEventListener('wheel', this.handleMouseWheel, false)
    documentElement.addEventListener('mousewheel', this.handleMouseWheel, false)
  },

  destroyed() {
    const { documentElement } = document

    window.removeEventListener('resize', this.recalcSection)
    document.removeEventListener('keydown', this.maybeScrollJack)
    documentElement.removeEventListener('wheel', this.handleMouseWheel, false)
    documentElement.removeEventListener(
      'mousewheel',
      this.handleMouseWheel,
      false
    )
    document.removeEventListener('touchstart', this.handleTouchstart)
    document.removeEventListener('touchmove', this.handleTouchmove, {
      passive: false,
    })
  },

  methods: {
    getCurrentSectionId() {
      return this[CURRENT_SECTION_KEY]
    },

    isSectionHidden(id) {
      return (this.getCurrentSectionId() !== id).toString()
    },

    getSectionOffsetDiffFromViewport(s) {
      return Math.abs(
        (parseInt(s.offsetTop) -
          parseInt(
            Math.abs(document.documentElement.getBoundingClientRect().top)
          )) /
          100
      )
    },

    recalcSection() {
      this.isMediumScreen = maybeMediumScreen()

      // Immediately resize sections on window resize (no smooth).
      goToSection([this.getSection()], false)
    },

    getSection(id = this.getCurrentSectionId()) {
      const sectionElem = document.querySelector(`[data-section='${id}']`)

      if (!sectionElem) return
      return sectionElem
    },

    goToNextSection() {
      goToSection([this.getSection(), 'next'])
    },

    goToPrevSection() {
      goToSection([this.getSection(), 'previous'])
    },

    scrollingLudicrouslyFast(ms = 100) {
      const curTime = new Date().getTime()
      const timeDiff = curTime - this.prevTime
      this.prevTime = curTime

      return timeDiff < ms
    },

    handleTouchstart(event) {
      if (typeof event.touches === 'undefined' || !this.isMediumScreen) return
      this.touchY = event.touches[0].clientY
    },

    handleTouchmove(event) {
      if (typeof event.changedTouches === 'undefined' || !this.isMediumScreen)
        return

      const curTouchY = event.changedTouches[0].clientY
      if (!this.scrollingLudicrouslyFast()) {
        if (this.touchY > curTouchY) this.goToNextSection()
        else this.goToPrevSection()
      }
    },

    handleMouseWheel(event) {
      if (!this.scrollingLudicrouslyFast()) {
        switch (Math.sign(event.deltaY)) {
          case 1:
            this.goToNextSection()
            break
          case -1:
            this.goToPrevSection()
            break
        }
      }
    },

    maybeScrollJack(event) {
      const isNavFocused = getEventPath(event).some(
        ({ id }) => id === NAVIGATION_ID
      )

      const isSectionFocused = getEventPath(event).some(
        ({ dataset }) => dataset && dataset.section
      )

      if (
        !isNavFocused &&
        !isSectionFocused &&
        event.target !== this.$el &&
        event.target !== document.body &&
        event.target !== this.$root.$el &&
        event.target !== document.documentElement
      )
        return

      const SPACEBAR = ' '

      if (!this.scrollingLudicrouslyFast(500)) {
        switch (event.key) {
          case 'Down':
          case SPACEBAR:
          case 'Spacebar':
          case 'ArrowDown':
          case 'Right':
          case 'PageDown':
          case 'ArrowRight':
            event.preventDefault()
            this.goToNextSection()
            break

          case 'Up':
          case 'ArrowUp':
          case 'Left':
          case 'PageUp':
          case 'ArrowLeft':
            event.preventDefault()
            this.goToPrevSection()
            break

          case 'Home':
            event.preventDefault()
            goToSection([this.getSection(SECTIONS[0])]) // first section
            break

          case 'End':
            event.preventDefault()
            goToSection([this.getSection(SECTIONS[SECTIONS.length - 1])]) // last section
            break
        }
      }
    },
  },

  render() {
    const { isSectionHidden } = this
    const [une, deux, trois, quatre, cinq] = SECTIONS

    return (
      <ContentView id="homepage">
        <PitchSlate name={une} aria-hidden={isSectionHidden(une)} />
        <Cornerstone name={deux} aria-hidden={isSectionHidden(deux)} />
        <Experience name={trois} aria-hidden={isSectionHidden(trois)} />
        <Carriageway name={quatre} aria-hidden={isSectionHidden(quatre)} />
        <Contact name={cinq} aria-hidden={isSectionHidden(cinq)} />
      </ContentView>
    )
  },
})

export default Homepage
