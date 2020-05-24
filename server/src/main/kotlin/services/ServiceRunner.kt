package services

import db.PickaxeDB
import db.GameMutator
import db.GamesQuery
import db.WeeksQuery
import dto.GameDTO
import dto.WeekDTO
import getEnvOrDefault
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.io.FileNotFoundException
import java.net.URL
import java.sql.Connection
import java.time.OffsetDateTime


class ServiceRunner {
    private val sixHours = 6 * 3600 * 1000L
    private val fiveMinutes = 5 * 60 * 1000L

    fun start() {
        val nflApiRoot = getEnvOrDefault("NFL_API_ROOT", "http://nfl-wiremock:8080")
        val nflApi = NflApi(URL("${nflApiRoot}/v1/reroute"), URL(nflApiRoot))
        val dbConnection = PickaxeDB().getDBConnection()

        GlobalScope.launch {
            while (true) {
                reloadAllWeeks(nflApi, dbConnection)
                updateGameDetailsForFinalGames(nflApi, dbConnection)
                delay(sixHours)
            }
        }

        GlobalScope.launch {
            while (true) {
                delay(fiveMinutes)
                if(hasImmanentGamesMissingId(WeeksQuery(dbConnection), GamesQuery(dbConnection))){
                    reloadAllWeeks(nflApi, dbConnection)
                }
                updateGameDetailsForFinalGames(nflApi, dbConnection)
            }
        }
    }

    private fun updateGameDetailsForFinalGames(nflApi: NflApi, dbConnection: Connection) {
        WeeksQuery(dbConnection).get().forEach { week ->
            updateDetailsForFinalGamesInWeek(week, dbConnection, nflApi)
        }
    }

    private fun updateDetailsForFinalGamesInWeek(
        week: WeekDTO,
        dbConnection: Connection,
        nflApi: NflApi
    ) {
        return GamesQuery(dbConnection).getGamesForWeek(week.name).forEach { baseGame ->
            updateDetailsForFinalGame(baseGame, nflApi, GameMutator(dbConnection))
        }
    }

    private fun reloadAllWeeks(nflApi: NflApi, dbConnection: Connection) {
        WeeksQuery(dbConnection).get().forEach { week ->
            reloadGamesForWeek(week, nflApi, GameMutator(dbConnection))
        }
    }

    companion object {
        fun reloadGamesForWeek(
            week: WeekDTO,
            nflApi: NflApi,
            gameMutator: GameMutator
        ) {
            var games: List<GameDTO> = ArrayList(0)
            try {
                games = nflApi.getWeek(week)
            } catch (e: FileNotFoundException) {
                println("Week ${week.name} could not be fetched - ${e.message}")
            }
            games.forEach { baseGame ->
                gameMutator.putInDatabase(baseGame)
            }
        }

        fun updateDetailsForFinalGame(
            baseGame: GameDTO,
            nflApi: NflApi,
            gameMutator: GameMutator
        ) {
            if (baseGame.id == null) {
                return
            }

            if (gameStartedMoreThanXHoursAgo(baseGame.gameTime, 2) &&
                gameResultNotRecorded(baseGame)
            ) {
                updateGameDetails(nflApi, baseGame, gameMutator)
            }
        }

        fun hasImmanentGamesMissingId(weeksQuery: WeeksQuery, gamesQuery: GamesQuery): Boolean {
            val weeks = weeksQuery.get()
            weeks.forEach { week ->
                if (weekHasImmanentGamesMissingId(week.name, gamesQuery)) {
                    return true
                }
            }
            return false
        }

        private fun gameResultNotRecorded(baseGame: GameDTO) = baseGame.result == null

        private fun updateGameDetails(nflApi: NflApi, baseGame: GameDTO, gameMutator: GameMutator) {
            try {
                val fetchedGame = nflApi.getGame(baseGame)
                gameMutator.putInDatabase(fetchedGame)
            } catch (e: FileNotFoundException) {
                println("Game ${baseGame.week} ${baseGame.name} could not be fetched - ${e.message}")
            }
        }

        private fun weekHasImmanentGamesMissingId(week: String, gamesQuery: GamesQuery): Boolean {
            return gamesQuery.getGamesForWeek(week).any {
                it.id == null && it.result == null &&
                        hasGameStartInXMinutes(it.gameTime, 15)
            }
        }

        private fun gameStartedMoreThanXHoursAgo(gameTime: OffsetDateTime?, hoursAgo: Long): Boolean {
            return gameTime != null &&
                    OffsetDateTime.now().isAfter(gameTime.plusHours(hoursAgo))
        }

        private fun hasGameStartInXMinutes(time: OffsetDateTime?, minutes: Long): Boolean {
            return time != null && time.minusMinutes(minutes).isBefore(OffsetDateTime.now())
        }
    }

}