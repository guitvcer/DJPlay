<template>
  <section class="flex justify-center flex-wrap">
    <home-game-item v-for="(game, index) in games" :key="index" :game="game" />
  </section>
</template>

<script>
import HomeGameItem from '@/components/HomeGameItem'

export default {
  components: {
    HomeGameItem
  },
  data() {
    return {
      games: [
        {
          id: 1,
          name: 'Гомоку',
          app_name: 'gomoku',
          rules: 'Гомоку — настольная логическая игра для двух игроков. На квадратной доске размером 15×15 пунктов игроки поочерёдно выставляют камни двух цветов. Выигрывает тот, кто первым построит непрерывный ряд из пяти камней своего цвета по вертикали, горизонтали или диагонали.',
          image: this.host + '/media/gomoku.png',
          is_released: true
        },
        {
          id: 2,
          name: 'Шахматы',
          app_name: 'chess',
          rules: 'Шахматная партия ведётся между двумя соперниками на шахматной доске путём передвижения шахматных фигур. Соперником в шахматной партии может быть один человек, коллектив из нескольких человек или компьютер.<ul><li>Партия считается выигранной шахматистом, который дал мат королю соперника.</li><li>Партия считается выигранной тем из партнёров, противник которого признал себя побеждённым.</li><li>Партия считается выигранной, если у одного из шахматистов закончилось время на ходы.</li></ul>',
          image: this.host + '/media/chess.png',
          is_released: false
        }
      ]
    }
  }
}
</script>