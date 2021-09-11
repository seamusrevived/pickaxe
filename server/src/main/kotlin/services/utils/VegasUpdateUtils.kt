package services.utils

import db.CurrentWeekQuery
import db.GameMutator
import db.GamesQuery
import db.UpdatePickMutator
import dto.*
import org.slf4j.LoggerFactory
import services.vegasapi.VegasPicksApiRepository
import services.utils.UpdateUtils.Companion.hasGameStartInXMinutes

class VegasUpdateUtils {
    companion object {

        private val logger: org.slf4j.Logger = LoggerFactory.getLogger(VegasUpdateUtils::class.toString())


        private const val vegasUserName = "Vegas"

        fun updateVegasPicks(
            currentWeekQuery: CurrentWeekQuery,
            gamesQuery: GamesQuery,
            gameMutator: GameMutator,
            pickMutator: UpdatePickMutator,
            vegasPicksApi: VegasPicksApiRepository
        ) {
            val currentWeekString = currentWeekQuery.getCurrentWeek().name

            vegasPicksApi.getVegasPicks().forEach { vegasPick ->
                logger.info("[updateVegasPicks] ${vegasPick.game} ${vegasPick.pick} ${vegasPick.spread}")
                updateVegasPickData(
                    currentWeekString,
                    gamesQuery,
                    pickMutator,
                    gameMutator,
                    vegasPick
                )
            }
        }

        private fun updateVegasPickData(
            currentWeekString: String,
            gamesQuery: GamesQuery,
            pickMutator: UpdatePickMutator,
            gameMutator: GameMutator,
            vegasPick: PickWithSpreadDTO
        ) {
            val gameInDbForVegasPick = findMatchingGameInDb(gamesQuery, currentWeekString, vegasPick)

            if (gameInDbForVegasPick != null) {
                updatePick(pickMutator, currentWeekString, gameInDbForVegasPick.name, vegasPick.pick)
                updateSpread(gameMutator, gameInDbForVegasPick, vegasPick.spread)
            }
        }

        private fun updateSpread(gameMutator: GameMutator, gameInDbForVegasPick: GameDTO, spread: Double) {
            val updatedGame = gameInDbForVegasPick.apply {
                this.spread = spread
            }
            gameMutator.putInDatabase(updatedGame)
        }

        private fun updatePick(
            pickMutator: UpdatePickMutator,
            currentWeekString: String,
            game: String,
            vegasPick: String
        ) {
            pickMutator.updatePick(
                UserDTO(vegasUserName),
                WeekDTO(currentWeekString),
                PickDTO(game, vegasPick)
            )
        }

        private fun findMatchingGameInDb(
            gamesQuery: GamesQuery,
            currentWeekString: String,
            vegasPick: PickWithSpreadDTO
        ): GameDTO? {
            return gamesQuery
                .getGamesForWeek(currentWeekString)
                .filter { gameIsNotSoon(it) }
                .firstOrNull { it.name == vegasPick.game }
        }

        private fun gameIsNotSoon(game: GameDTO): Boolean {
            return game.gameTime != null && !hasGameStartInXMinutes(game.gameTime, 15)
        }
    }
}