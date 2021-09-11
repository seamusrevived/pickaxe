package services.nflapi

import com.auth0.jwt.JWT
import com.fasterxml.jackson.databind.ObjectMapper
import dto.GameDTO
import dto.WeekDTO
import services.utils.NestedMapUtil
import java.io.DataOutputStream
import java.io.FileNotFoundException
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL
import java.text.SimpleDateFormat
import java.util.*
import kotlin.collections.HashMap

class NflApiRepository(private val tokenURL: URL, private val apiURL: URL, private val season: String) {

    private var _accessToken: String? = null
    var now = { Date() }

    private val formatter = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.000'Z'")

    init {
        formatter.timeZone = TimeZone.getTimeZone("UTC")
    }

    var accessToken: String
        get() {
            if (!tokenIsValid(_accessToken)) {
                _accessToken = fetchNewToken()
            }
            return _accessToken!!
        }
        set(token) {
            _accessToken = token
        }

    private fun tokenIsValid(token: String?): Boolean {
        return token != null && now() < JWT.decode(token).expiresAt
    }

    private fun fetchNewToken(): String {
        val connection = tokenURL.openConnection() as HttpURLConnection
        connection.let {
            it.requestMethod = "POST"
            it.doOutput = true
            setCommonHeaders(it)
            it.setRequestProperty("x-domain-id", "100")
        }

        val dataOutputStream = DataOutputStream(connection.outputStream)
        dataOutputStream.writeBytes("grant_type=client_credentials")
        dataOutputStream.close()

        val stream = connection.inputStream
        val response = InputStreamReader(stream).readText()
        return responseMap(response)["access_token"] as String
    }

    private fun responseMap(response: String) = ObjectMapper().readValue(response, HashMap::class.java)

    fun fetchGamesForWeek(week: WeekDTO): List<GameDTO> =
        fetchGameResponsesForWeek(week)
            .map { response -> buildGame(week, response) }

    private fun fetchGameResponsesForWeek(week: WeekDTO): List<GameResponse> {
        return createWeekQueryConnection(week)
            .inputStream
            .let { responseMap(InputStreamReader(it).readText()) }
            .let { NestedMapUtil.extractList(it, "games") }!!
            .map { game -> GameResponse(game as HashMap<*, *>) }
    }

    private fun createWeekQueryConnection(week: WeekDTO): HttpURLConnection {
        val fullApiUrl = URL(
            apiURL,
            "/experience/v1/games?season=${season}&seasonType=${week.weekType}&week=${week.week}"
        )

        return connectionWithQueryHeaders(fullApiUrl)
    }

    private fun buildGame(week: WeekDTO, game: GameResponse): GameDTO {
        return GameDTO(formatGameName(game), week.name).apply {
            id = game.details?.id
            gameTime = game.time
        }
    }

    private fun formatGameName(game: GameResponse): String =
        "${game.awayTeam.abbreviation}@${game.homeTeam.abbreviation}"


    fun fetchGameWithResult(game: GameDTO): GameDTO {
        if (game.id == null) {
            throw FileNotFoundException("Game ID not defined")
        }

        val details = fetchGameDetailsForId(game.id!!)

        return GameDTO(game.name, game.week).apply {
            result = details.getOutcome()
            id = game.id
            gameTime = game.gameTime
        }
    }

    private fun fetchGameDetailsForId(gameId: UUID): Details {
        val gameQueryDetailsPath = listOf("data", "viewer", "gameDetailsByIds")
        return createGameQueryConnection(gameId)
            .inputStream
            .let { stream -> InputStreamReader(stream).readText() }
            .let { response -> responseMap(response) }
            .let { map -> NestedMapUtil.extractValue(map, gameQueryDetailsPath) as List<*> }
            .let { detailsMap -> Details(detailsMap.first() as HashMap<*, *>) }
    }

    private fun createGameQueryConnection(id: UUID): HttpURLConnection {
        val fullUrl =
            URL(
                apiURL,
                "/v3/shield/?query=query%7Bviewer%7BgameDetailsByIds(ids%3A%5B%22$id%22%2C%5D)%7Bid%2Cphase%2ChomePointsTotal%2CvisitorPointsTotal%2Cphase%2ChomeTeam%7Babbreviation%7D%2CvisitorTeam%7Babbreviation%7D%7D%7D%7D&variables=null\n"
            )

        return connectionWithQueryHeaders(fullUrl)

    }

    private fun setCommonHeaders(connection: HttpURLConnection) {
        connection.setRequestProperty("authority", "api.nfl.com")
        connection.setRequestProperty("origin", "https://www.nfl.com")
        connection.setRequestProperty("referer", "https://www.nfl.com/")
        connection.setRequestProperty(
            "user-agent",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36"
        )
    }

    private fun connectionWithQueryHeaders(fullUrl: URL): HttpURLConnection {
        val connection = fullUrl.openConnection() as HttpURLConnection
        connection.let {
            setCommonHeaders(it)
            it.setRequestProperty("authorization", "Bearer $accessToken")
            it.setRequestProperty("accept", "*/*")
            it.setRequestProperty("Content-Type", "application/json")
        }
        return connection
    }
}


