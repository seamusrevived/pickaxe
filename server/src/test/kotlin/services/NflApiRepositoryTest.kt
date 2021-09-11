package services

import com.auth0.jwt.JWT
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.net.HttpURLConnection
import java.net.URL
import com.auth0.jwt.algorithms.Algorithm
import com.fasterxml.jackson.databind.ObjectMapper
import dto.GameDTO
import dto.WeekDTO
import io.mockk.*
import org.junit.jupiter.api.Assertions.*
import services.nflapi.NflApiRepository
import java.io.*
import java.text.SimpleDateFormat
import java.time.*
import java.util.*
import kotlin.collections.ArrayList


class NflApiRepositoryTest {
    private val handler = MockURLStreamHandler
    private val tokenURL = URL("https://tokenendpoint")
    private val baseApiUrl = URL("http://apiuri")
    private val mockTokenConnection = mockkClass(HttpURLConnection::class)
    private val mockApiConnection = mockkClass(HttpURLConnection::class)

    private val season = 2019

    private val absoluteTime = { GregorianCalendar(season, 3, 12, 13, 5).time }

    private val requestOutputStream = ByteArrayOutputStream()

    private val formatter = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.000'Z'")

    private val defaultId = UUID.fromString("10012016-1006-0091-2590-6d5ccb310545")

    private val defaultGameStart = OffsetDateTime.of(
        2020, 4, 25,
        12, 20, 55, 0,
        ZoneOffset.of("-0500")
    )

    @Suppress("unused")
    private val defaultGames = object {
        var games: List<Any> = listOf(buildGame("ARI", "SF", defaultGameStart, defaultId))
    }

    @BeforeEach
    fun beforeEach() {
        formatter.timeZone = TimeZone.getTimeZone("UTC")

        handler.setConnection(tokenURL, mockTokenConnection)
        every { mockTokenConnection.requestMethod = "POST" } returns Unit
        every { mockTokenConnection.outputStream } returns requestOutputStream
        every { mockTokenConnection.doOutput = true } returns Unit
        every { mockTokenConnection.setRequestProperty(any(), any()) } returns Unit
        every { mockTokenConnection.inputStream } returns buildByteStreamResponse("default-token")
        every { mockApiConnection.setRequestProperty(any(), any()) } returns Unit
    }

    @Test
    fun shouldGetApiTokenWithGetAccessTokenOfToken() {
        val expectedToken = generateExpiringToken(1)
        every { mockTokenConnection.inputStream } returns buildByteStreamResponse(expectedToken)
        val nflService = nflServiceWithFixedTime(tokenURL)

        val token = nflService.accessToken

        assertEquals(expectedToken, token)
    }

    @Test
    fun shouldMakePOSTToGetToken() {
        val expectedToken = generateExpiringToken(1)
        every { mockTokenConnection.inputStream } returns buildByteStreamResponse(expectedToken)
        val nflService = nflServiceWithFixedTime(tokenURL)

        nflService.accessToken

        verify(exactly = 1) { mockTokenConnection.requestMethod = "POST" }
    }

    @Test
    fun outputStreamPOSTsWithGrantTypeBody() {
        val expectedBody = "grant_type=client_credentials"

        val expectedToken = generateExpiringToken(1)
        every { mockTokenConnection.inputStream } returns buildByteStreamResponse(expectedToken)
        val nflService = nflServiceWithFixedTime(tokenURL)

        nflService.accessToken

        assertArrayEquals(expectedBody.toByteArray(), requestOutputStream.toByteArray())
    }


    @Test
    fun connectionHasCorrectPropertiesSet() {
        val expectedToken = generateExpiringToken(1)
        every { mockTokenConnection.inputStream } returns buildByteStreamResponse(expectedToken)
        val nflService = nflServiceWithFixedTime(tokenURL)

        nflService.accessToken

        val properties = ArrayList<String>(5).apply {
            add("authority")
            add("origin")
            add("x-domain-id")
            add("referer")
            add("user-agent")
        }

        properties.map { property ->
            verify { mockTokenConnection.setRequestProperty(property, any()) }
        }
    }

    @Test
    fun shouldGetApiTokenWithGetAccessTokenOfLongToken() {
        val expectedToken = generateExpiringToken(2)
        every { mockTokenConnection.inputStream } returns buildByteStreamResponse(expectedToken)
        val nflService = nflServiceWithFixedTime(tokenURL)

        val token = nflService.accessToken

        assertEquals(expectedToken, token)
    }

    @Test
    fun ifAccessTokenIsSetAndValidDoNotFetchNewToken() {
        val expectedToken = generateExpiringToken(1)
        val nflService = nflServiceWithFixedTime(tokenURL, expectedToken)
        val unexpectedToken = generateExpiringToken(2)
        every { mockTokenConnection.inputStream } returns buildByteStreamResponse(unexpectedToken)

        val token = nflService.accessToken

        assertEquals(expectedToken, token)
    }

    @Test
    fun gettingTokenTwiceWillOnlyFetchOnce() {
        val nflService = nflServiceWithFixedTime(tokenURL)
        val expectedToken = generateExpiringToken(1)
        val unexpectedToken = generateExpiringToken(2)

        every {
            mockTokenConnection.inputStream
        } returnsMany listOf(
            buildByteStreamResponse(expectedToken),
            buildByteStreamResponse(unexpectedToken)
        )


        nflService.accessToken
        val secondToken = nflService.accessToken

        assertEquals(expectedToken, secondToken)
        verify(exactly = 1) { mockTokenConnection.inputStream }
    }

    @Test
    fun ifAccessTokenIsSetAndInvalidFetchNewToken() {
        val expiredToken = generateExpiringToken(-1)
        val nflService = nflServiceWithFixedTime(tokenURL, expiredToken)
        val expectedToken = generateExpiringToken(1)
        every { mockTokenConnection.inputStream } returns buildByteStreamResponse(expectedToken)

        val token = nflService.accessToken

        assertEquals(expectedToken, token)
    }


    @Test
    fun getWeekGetsGamesFromNFLWithOneGameRegularWeek5() {
        val weekTypeQuery = "REG"
        val weekQuery = 5
        val weekName = "Week 5"
        val week = WeekDTO(weekName).apply {
            weekType = weekTypeQuery
            week = weekQuery
        }
        val uri = buildRelativeApiWeekQueryUrl(season, weekTypeQuery, weekQuery)
        handler.setConnection(URL(baseApiUrl, uri), mockApiConnection)
        val expectedGames = defaultGames

        every { mockApiConnection.inputStream } returns ObjectMapper().writeValueAsString(expectedGames)
            .byteInputStream()

        val result = NflApiRepository(tokenURL, baseApiUrl, season.toString()).fetchGamesForWeek(week)

        verify(exactly = 1) { mockApiConnection.inputStream }
        assertEquals(1, result.size)
        assertEquals("ARI@SF", result.first().name)
        assertEquals(weekName, result.first().week)
        assertEquals(defaultId, result.first().id)
        assertEquals(defaultGameStart, result.first().gameTime)
    }

    @Test
    fun `games without detail do not have id`() {
        val weekTypeQuery = "REG"
        val weekQuery = 5
        val weekName = "Week 5"
        val week = WeekDTO(weekName).apply {
            weekType = weekTypeQuery
            week = weekQuery
        }
        val uri = buildRelativeApiWeekQueryUrl(season, weekTypeQuery, weekQuery)
        handler.setConnection(URL(baseApiUrl, uri), mockApiConnection)

        @Suppress("unused")
        val expectedGames = object {
            val games: List<Any> = listOf(object {
                var time = defaultGameStart.toString()
                var awayTeam = object {
                    var nickName = "Cardinals"
                    var abbreviation = "GB"
                }
                var homeTeam = object {
                    var nickName = "49ers"
                    var abbreviation = "CHI"
                }
            })
        }
        every { mockApiConnection.inputStream } returns ObjectMapper().writeValueAsString(expectedGames)
            .byteInputStream()

        val result = NflApiRepository(tokenURL, baseApiUrl, season.toString()).fetchGamesForWeek(week)

        assertNull(result.first().id)
    }

    @Test
    fun `games without id but with detail do not have id`() {
        val weekTypeQuery = "REG"
        val weekQuery = 5
        val weekName = "Week 5"
        val week = WeekDTO(weekName).apply {
            weekType = weekTypeQuery
            week = weekQuery
        }
        val uri = buildRelativeApiWeekQueryUrl(season, weekTypeQuery, weekQuery)
        handler.setConnection(URL(baseApiUrl, uri), mockApiConnection)

        @Suppress("unused")
        val expectedGames = object {
            val games = listOf(buildGame("GB", "CHI", defaultGameStart, null))
        }
        every { mockApiConnection.inputStream } returns ObjectMapper().writeValueAsString(expectedGames)
            .byteInputStream()

        val result = NflApiRepository(tokenURL, baseApiUrl, season.toString()).fetchGamesForWeek(week)

        assertNull(result.first().id)
    }


    @Test
    fun `games without time from query do not have time`() {
        val weekTypeQuery = "REG"
        val weekQuery = 5
        val weekName = "Week 5"
        val week = WeekDTO(weekName).apply {
            weekType = weekTypeQuery
            week = weekQuery
        }
        val uri = buildRelativeApiWeekQueryUrl(season, weekTypeQuery, weekQuery)
        handler.setConnection(URL(baseApiUrl, uri), mockApiConnection)

        @Suppress("unused")
        val expectedGames = object {
            val games: List<Any> = listOf(object {
                var awayTeam = object {
                    var nickName = "Cardinals"
                    var abbreviation = "GB"
                }
                var homeTeam = object {
                    var nickName = "49ers"
                    var abbreviation = "CHI"
                }
            })
        }
        every { mockApiConnection.inputStream } returns ObjectMapper().writeValueAsString(expectedGames)
            .byteInputStream()

        val result = NflApiRepository(tokenURL, baseApiUrl, season.toString()).fetchGamesForWeek(week)

        assertNull(result.first().gameTime)
    }

    @Test
    fun getWeekGetsGamesFromNFLWithOneGamePreseasonWeek1() {
        val weekTypeQuery = "PRE"
        val weekQuery = 1
        val weekName = "Preseason Week 1"
        val week = WeekDTO(weekName).apply {
            weekType = weekTypeQuery
            week = weekQuery
        }
        val uri = buildRelativeApiWeekQueryUrl(season, weekTypeQuery, weekQuery)
        handler.setConnection(URL(baseApiUrl, uri), mockApiConnection)
        every { mockApiConnection.setRequestProperty(any(), any()) } returns Unit
        val expectedGames = defaultGames
        every { mockApiConnection.inputStream } returns ObjectMapper().writeValueAsString(expectedGames)
            .byteInputStream()

        val result = NflApiRepository(tokenURL, baseApiUrl, season.toString()).fetchGamesForWeek(week)

        verify(exactly = 1) { mockApiConnection.inputStream }
        assertEquals(1, result.size)
        assertEquals(weekName, result.first().week)
    }

    @Test
    fun getWeekWithDifferentBaseUrl() {
        val weekTypeQuery = "REG"
        val weekQuery = 5
        val weekName = "Week 5"
        val uri = buildRelativeApiWeekQueryUrl(season, weekTypeQuery, weekQuery)
        val week = WeekDTO(weekName).apply {
            weekType = weekTypeQuery
            week = weekQuery
        }
        val differentBaseUrl = URL("https://api.nfl.com")
        val mockConnection = mockkClass(HttpURLConnection::class)
        handler.setConnection(URL(differentBaseUrl, uri), mockConnection)
        every { mockConnection.setRequestProperty(any(), any()) } returns Unit
        val expectedGames = defaultGames
        every { mockConnection.inputStream } returns ObjectMapper().writeValueAsString(expectedGames).byteInputStream()

        val result = NflApiRepository(tokenURL, differentBaseUrl, season.toString()).fetchGamesForWeek(week)

        verify(exactly = 1) { mockConnection.inputStream }
        assertEquals(1, result.size)
        assertEquals("ARI@SF", result.first().name)
        assertEquals(weekName, result.first().week)
    }


    @Test
    fun getWeekGetsGamesFromNFLWithTwoGamesRegularWeek8() {
        val weekName = "Week 8"
        val weekTypeQuery = "REG"
        val weekQuery = 8
        val uri = buildRelativeApiWeekQueryUrl(season, weekTypeQuery, weekQuery)
        val week = WeekDTO(weekName).apply {
            weekType = weekTypeQuery
            week = weekQuery
        }
        handler.setConnection(URL(baseApiUrl, uri), mockApiConnection)
        @Suppress("unused")
        val expectedGames = object {
            var games: List<Any> = listOf(
                buildGame("CHI", "IND", defaultGameStart, defaultId),
                buildGame("TEN", "MIA", defaultGameStart.plusHours(3), defaultId)

            )
        }
        every { mockApiConnection.inputStream } returns ObjectMapper().writeValueAsString(expectedGames)
            .byteInputStream()

        val result = NflApiRepository(tokenURL, baseApiUrl, season.toString()).fetchGamesForWeek(week)

        verify(exactly = 1) { mockApiConnection.inputStream }
        assertEquals(2, result.size)
        assertEquals("CHI@IND", result[0].name)
        assertEquals(weekName, result[0].week)
        assertEquals("TEN@MIA", result[1].name)
        assertEquals(weekName, result[1].week)
        assertEquals(defaultGameStart.plusHours(3), result[1].gameTime)
    }

    @Test
    fun weekRequestHasStaticHeadersSet() {
        val uri = buildRelativeApiWeekQueryUrl(season, "REG", 3)
        val week = WeekDTO("Week 3").apply {
            weekType = "REG"
            week = 3
        }
        handler.setConnection(URL(baseApiUrl, uri), mockApiConnection)


        every { mockApiConnection.inputStream } returns
                ObjectMapper().writeValueAsString(defaultGames).byteInputStream()

        NflApiRepository(tokenURL, baseApiUrl, season.toString()).fetchGamesForWeek(week)

        val properties = ArrayList<String>(5).apply {
            add("authority")
            add("origin")
            add("accept")
            add("referer")
            add("user-agent")
            add("Content-Type")
        }
        properties.map { property ->
            verify { mockApiConnection.setRequestProperty(property, any()) }
        }
    }

    @Test
    fun weekRequestHasBearerTokenSet() {
        val uri = buildRelativeApiWeekQueryUrl(season, "REG", 3)
        handler.setConnection(URL(baseApiUrl, uri), mockApiConnection)
        val token = generateExpiringToken(1)
        every { mockTokenConnection.inputStream } returns buildByteStreamResponse(token)
        every { mockApiConnection.inputStream } returns ObjectMapper().writeValueAsString(defaultGames)
            .byteInputStream()
        val week = WeekDTO("Week 3").apply {
            weekType = "REG"
            week = 3
        }

        NflApiRepository(tokenURL, baseApiUrl, season.toString()).fetchGamesForWeek(week)

        verify { mockApiConnection.setRequestProperty("authorization", "Bearer $token") }
    }

    @Test
    fun `weekRequest for 2020 season HasBearerTokenSet`() {
        val expectedSeason = 2020
        val uri = buildRelativeApiWeekQueryUrl(expectedSeason, "REG", 3)
        handler.setConnection(URL(baseApiUrl, uri), mockApiConnection)
        val token = generateExpiringToken(1)
        every { mockTokenConnection.inputStream } returns buildByteStreamResponse(token)
        every { mockApiConnection.inputStream } returns ObjectMapper().writeValueAsString(defaultGames)
            .byteInputStream()
        val week = WeekDTO("Week 3").apply {
            weekType = "REG"
            week = 3
        }

        NflApiRepository(tokenURL, baseApiUrl, expectedSeason.toString()).fetchGamesForWeek(week)

        verify { mockApiConnection.setRequestProperty("authorization", "Bearer $token") }
    }

    @Test
    fun gameRequestForFinalGameUpdatesResultWithWinnerCHIAtHome() {
        val gameUuid = "10160000-dd69-64b5-f7c3-0be4babbf0ff"
        val uri = buildGameQueryUrl(gameUuid)
        handler.setConnection(URL(baseApiUrl, uri), mockApiConnection)
        val details: Map<String, Any> = mapOf(
            "phase" to "FINAL",
            "homePointsTotal" to 107,
            "visitorPointsTotal" to 0,
            "homeTeam" to mapOf("abbreviation" to "CHI"),
            "visitorTeam" to mapOf("abbreviation" to "GB")
        )

        val game = buildGameResponseFromDetails(details)
        every { mockApiConnection.inputStream } returns ObjectMapper().writeValueAsString(game)
            .byteInputStream()

        val gameDTO = GameDTO("GB@CHI", "Week 4").apply {
            id = UUID.fromString(gameUuid)
        }

        val result: GameDTO = NflApiRepository(tokenURL, baseApiUrl, season.toString()).fetchGameWithResult(gameDTO)

        assertEquals("CHI", result.result)
    }

    @Test
    fun gameRequestHasCopiedId() {
        val gameUuid = "10160000-dd69-64b5-f7c3-0be4babbf0ff"
        val uri = buildGameQueryUrl(gameUuid)
        handler.setConnection(URL(baseApiUrl, uri), mockApiConnection)
        every { mockApiConnection.inputStream } returns ObjectMapper().writeValueAsString(defaultGame())
            .byteInputStream()
        val gameDTO = GameDTO("GB@CHI", "Week 4").apply {
            id = UUID.fromString(gameUuid)
        }

        val result: GameDTO = NflApiRepository(tokenURL, baseApiUrl, season.toString()).fetchGameWithResult(gameDTO)

        assertEquals(gameUuid, result.id.toString())
    }

    @Test
    fun gameRequestHasCopiedTime() {
        val gameUuid = "10160000-dd69-64b5-f7c3-0be4babbf0ff"
        val uri = buildGameQueryUrl(gameUuid)
        handler.setConnection(URL(baseApiUrl, uri), mockApiConnection)
        every { mockApiConnection.inputStream } returns ObjectMapper().writeValueAsString(defaultGame())
            .byteInputStream()
        val gameDTO = GameDTO("GB@CHI", "Week 4").apply {
            id = UUID.fromString(gameUuid)
            gameTime = OffsetDateTime.of(
                2020, 5, 17,
                0, 3, 55, 2000,
                ZoneOffset.ofHours(-5)
            )
        }

        val result: GameDTO = NflApiRepository(tokenURL, baseApiUrl, season.toString()).fetchGameWithResult(gameDTO)

        assertEquals(gameDTO.gameTime, result.gameTime)
    }

    @Test
    fun gameRequestWithoutIdThrowsFileNotFoundException() {
        val gameDTO = GameDTO("GB@CHI", "Week 4").apply {
            id = null
            gameTime = OffsetDateTime.of(
                2020, 5, 17,
                0, 3, 55, 2000,
                ZoneOffset.ofHours(-5)
            )
        }

        assertThrows(FileNotFoundException::class.java) {
            NflApiRepository(tokenURL, baseApiUrl, season.toString()).fetchGameWithResult(gameDTO)
        }
    }

    @Test
    fun gameRequestForFinalOvertimeGameUpdatesResultWithWinnerCHIAtHome() {
        val gameUuid = "10160000-dd69-64b5-f7c3-0be4babbf0ff"
        val uri = buildGameQueryUrl(gameUuid)
        handler.setConnection(URL(baseApiUrl, uri), mockApiConnection)
        val details: Map<String, Any> = mapOf(
            "phase" to "FINAL_OVERTIME",
            "homePointsTotal" to 7,
            "visitorPointsTotal" to 3,
            "homeTeam" to mapOf("abbreviation" to "CHI"),
            "visitorTeam" to mapOf("abbreviation" to "GB")
        )
        val game = buildGameResponseFromDetails(details)
        every { mockApiConnection.inputStream } returns ObjectMapper().writeValueAsString(game)
            .byteInputStream()
        val gameDTO = GameDTO("GB@CHI", "Week 4").apply {
            id = UUID.fromString(gameUuid)
        }

        val result: GameDTO = NflApiRepository(tokenURL, baseApiUrl, season.toString()).fetchGameWithResult(gameDTO)

        assertEquals("CHI", result.result)
    }

    @Test
    fun gameRequestForFinalGameUpdatesResultWithWinnerTBAway() {
        val gameUuid = "1016aa00-05f9-64b5-f7c3-0be4baabf0ff"
        val uri = buildGameQueryUrl(gameUuid)

        handler.setConnection(URL(baseApiUrl, uri), mockApiConnection)

        val details: Map<String, Any> = mapOf(
            "phase" to "FINAL",
            "homePointsTotal" to 3,
            "visitorPointsTotal" to 17,
            "homeTeam" to mapOf("abbreviation" to "NE"),
            "visitorTeam" to mapOf("abbreviation" to "TB")
        )
        val game = buildGameResponseFromDetails(details)
        every { mockApiConnection.inputStream } returns ObjectMapper().writeValueAsString(game)
            .byteInputStream()

        val gameDTO = GameDTO("TB@NE", "Week 12").apply {
            id = UUID.fromString(gameUuid)
        }

        val result: GameDTO = NflApiRepository(tokenURL, baseApiUrl, season.toString()).fetchGameWithResult(gameDTO)

        assertEquals(result.name, gameDTO.name)
        assertEquals(result.week, gameDTO.week)
        assertEquals("TB", result.result)
    }

    @Test
    fun gameRequestForFinalGameUpdatesResultWithTIE() {
        val gameUuid = "1016000c-0569-6425-f7c3-0be4baabfaff"
        val uri = buildGameQueryUrl(gameUuid)
        handler.setConnection(URL(baseApiUrl, uri), mockApiConnection)
        val details: Map<String, Any> = mapOf(
            "phase" to "FINAL",
            "homePointsTotal" to 3,
            "visitorPointsTotal" to 3,
            "homeTeam" to mapOf("abbreviation" to "NE"),
            "visitorTeam" to mapOf("abbreviation" to "TB")
        )
        val game = buildGameResponseFromDetails(details)
        every { mockApiConnection.inputStream } returns ObjectMapper().writeValueAsString(game)
            .byteInputStream()
        val gameDTO = GameDTO("CLE@CIN", "Week 7").apply {
            id = UUID.fromString(gameUuid)
        }

        val result: GameDTO = NflApiRepository(tokenURL, baseApiUrl, season.toString()).fetchGameWithResult(gameDTO)

        assertEquals("TIE", result.result)
    }

    @Test
    fun gameRequestForInProgressGameDoesNotHaveResult() {
        val gameUuid = "10160000-0569-3333-f7c3-0be4baabf0ff"
        val uri = buildGameQueryUrl(gameUuid)

        handler.setConnection(URL(baseApiUrl, uri), mockApiConnection)
        val details: Map<String, Any> = mapOf(
            "phase" to "In progress",
            "homePointsTotal" to 17,
            "visitorPointsTotal" to 3,
            "homeTeam" to mapOf("abbreviation" to "NE"),
            "visitorTeam" to mapOf("abbreviation" to "TB")
        )
        val game = buildGameResponseFromDetails(details)
        every { mockApiConnection.inputStream } returns ObjectMapper().writeValueAsString(game)
            .byteInputStream()

        val gameDTO = defaultGameDTO(gameUuid)
        val result: GameDTO = NflApiRepository(tokenURL, baseApiUrl, season.toString()).fetchGameWithResult(gameDTO)

        assertEquals(result.name, gameDTO.name)
        assertEquals(result.week, gameDTO.week)
        assertEquals(null, result.result)
    }

    @Test
    fun gameRequestHasStaticHeadersSet() {
        val gameUuid = "10160000-0569-64b5-f7c3-0be4b4abf0ff"
        val uri = buildGameQueryUrl(gameUuid)
        handler.setConnection(URL(baseApiUrl, uri), mockApiConnection)

        every { mockApiConnection.inputStream } returns
                ObjectMapper().writeValueAsString(defaultGame()).byteInputStream()

        NflApiRepository(tokenURL, baseApiUrl, season.toString()).fetchGameWithResult(defaultGameDTO(gameUuid))

        val properties = ArrayList<String>(5).apply {
            add("authority")
            add("origin")
            add("accept")
            add("referer")
            add("user-agent")
            add("Content-Type")
        }
        properties.map { property ->
            verify { mockApiConnection.setRequestProperty(property, any()) }
        }
    }

    @Test
    fun gameRequestHasBearerTokenSet() {
        val gameUuid = "10160000-0569-64b5-f7c3-0be4baabf0ff"
        val uri = buildGameQueryUrl(gameUuid)
        handler.setConnection(URL(baseApiUrl, uri), mockApiConnection)
        val token = generateExpiringToken(4)
        every { mockTokenConnection.inputStream } returns buildByteStreamResponse(token)

        every { mockApiConnection.inputStream } returns ObjectMapper().writeValueAsString(defaultGame())
            .byteInputStream()

        val gameDTO = defaultGameDTO(gameUuid)
        NflApiRepository(tokenURL, baseApiUrl, season.toString()).fetchGameWithResult(gameDTO)

        verify { mockApiConnection.setRequestProperty("authorization", "Bearer $token") }
    }

    private fun defaultGameDTO(gameUuid: String): GameDTO {
        return GameDTO("TB@NE", "Week 14").apply {
            id = UUID.fromString(gameUuid)
        }
    }


    private fun defaultGame(): Any {

        val details: Map<String, Any> = mapOf(
            "phase" to "In progress",
            "homePointsTotal" to 17,
            "visitorPointsTotal" to 3,
            "homeTeam" to mapOf("abbreviation" to "NE"),
            "visitorTeam" to mapOf("abbreviation" to "TB")
        )

        return buildGameResponseFromDetails(details)
    }

    @Suppress("unused")
    private fun buildGameResponseFromDetails(details: Map<String, Any>): Any {
        return object {
            val data = object {
                val viewer = object {
                    val gameDetailsByIds = listOf(details)
                }
            }
        }
    }

    private fun buildGameQueryUrl(gameUuid: String) =
        "/v3/shield/?query=query%7Bviewer%7BgameDetailsByIds(ids%3A%5B%22$gameUuid%22%2C%5D)%7Bid%2Cphase%2ChomePointsTotal%2CvisitorPointsTotal%2Cphase%2ChomeTeam%7Babbreviation%7D%2CvisitorTeam%7Babbreviation%7D%7D%7D%7D&variables=null\n"

    private fun buildRelativeApiWeekQueryUrl(
        season: Int,
        weekTypeQuery: String,
        weekQuery: Int
    ): String {
        return "/experience/v1/games?season=${season}&seasonType=${weekTypeQuery}&week=${weekQuery}"
    }

    private fun nflServiceWithFixedTime(url: URL, token: String? = null): NflApiRepository {
        val service = NflApiRepository(url, baseApiUrl, season.toString()).apply {
            now = absoluteTime
        }
        if (token != null) {
            service.accessToken = token
        }
        return service
    }

    private fun generateExpiringToken(hoursToExpiration: Int): String {
        val algorithmHS: Algorithm = Algorithm.HMAC256("secret")

        val issued = absoluteTime()
        val expires = with(GregorianCalendar()) {
            time = issued
            add(Calendar.HOUR, hoursToExpiration)
            time
        }

        return JWT.create()
            .withIssuedAt(issued)
            .withExpiresAt(expires)
            .withClaim("clientId", "xxx")
            .sign(algorithmHS)
    }

    private fun buildByteStreamResponse(expectedToken: String) = buildTokenResponse(expectedToken).byteInputStream()

    @Suppress("unused")
    private fun buildGame(away: String, home: String, time: OffsetDateTime, id: UUID?): Any {
        return object {
            var time = time.toString()
            var awayTeam = object {
                var nickName = "Cardinals"
                var abbreviation = away
            }
            var homeTeam = object {
                var nickName = "49ers"
                var abbreviation = home
            }
            var detail = object {
                var id = id
            }
        }
    }


    @Suppress("unused")
    private fun buildTokenResponse(expectedToken: String): String {
        return ObjectMapper().writeValueAsString(object {
            val access_token = expectedToken
            val expires_in = 3600
            val refresh_token = null
            val scope = null
            val token_type = "Bearer"
        })
    }
}
