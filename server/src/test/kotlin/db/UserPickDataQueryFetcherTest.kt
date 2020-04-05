package db

import dto.PickDTO
import dto.UserDTO
import dto.UserPicksDTO
import graphql.schema.DataFetchingEnvironment
import graphql.schema.DataFetchingEnvironmentImpl
import io.mockk.MockKAdditionalAnswerScope
import io.mockk.every
import io.mockk.mockkClass
import io.mockk.mockkStatic
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.sql.Connection
import java.sql.DriverManager
import java.sql.ResultSet
import java.sql.Statement

class UserPickDataQueryFetcherTest {
    private lateinit var userPickDataQueryFetcher: UserPickDataQueryFetcher
    private lateinit var mockStatement: Statement
    private lateinit var mockConnection: Connection

    @BeforeEach
    fun setup() {
        mockkStatic("java.sql.DriverManager")
        mockConnection = mockkClass(Connection::class)
        mockStatement = mockkClass(Statement::class)

        every { DriverManager.getConnection(any()) } returns null
        every { DriverManager.getConnection(any(), any()) } returns mockConnection
        every { mockConnection.createStatement() } returns mockStatement

        userPickDataQueryFetcher = UserPickDataQueryFetcher(mockConnection)
    }

    @Test
    fun getReturnsUserPicksWithOneUserAndOnePickForWeekWithWeek0() {
        val week = 0
        val expectedPicks: ArrayList<UserPicksDTO> = ArrayList(1)
        expectedPicks.add(UserPicksDTO(UserDTO("Seamus")))
        expectedPicks[0].picks.add(PickDTO("GB@CHI", "CHI"))

        setupMocksForPicks(expectedPicks, setupResultMockForOneUserOnePick, week)
        val env = getEnvForWeek(week)

        val results = UserPickDataQueryFetcher(mockConnection).get(env)

        assertEquals(expectedPicks.map { x -> x.user.name }, results.map { x -> x.user.name })
        assertEquals(expectedPicks[0].picks.map { x -> x.game }, results[0].picks.map { x -> x.game })
        assertEquals(expectedPicks[0].picks.map { x -> x.pick }, results[0].picks.map { x -> x.pick })
    }

    @Test
    fun getReturnsUserPicksWithOneUserAndOnePickForWeekWithWeek7() {
        val week = 7
        val expectedPicks: ArrayList<UserPicksDTO> = ArrayList(1)
        expectedPicks.add(UserPicksDTO(UserDTO("Seamus")))
        expectedPicks[0].picks.add(PickDTO("GB@CHI", "CHI"))

        setupMocksForPicks(expectedPicks, setupResultMockForOneUserOnePick, week)
        val env = getEnvForWeek(week)

        val results = UserPickDataQueryFetcher(mockConnection).get(env)

        assertEquals(expectedPicks.map { x -> x.user.name }, results.map { x -> x.user.name })
        assertEquals(expectedPicks[0].picks.map { x -> x.game }, results[0].picks.map { x -> x.game })
        assertEquals(expectedPicks[0].picks.map { x -> x.pick }, results[0].picks.map { x -> x.pick })
    }

    @Test
    fun getReturnsUserPicksWithTwoUsersAndOnePickForWeekWithWeek0() {
        val week = 0
        val expectedPicks: ArrayList<UserPicksDTO> = ArrayList(1)
        expectedPicks.add(UserPicksDTO(UserDTO("Seamus")))
        expectedPicks[0].picks.add(PickDTO("GB@CHI", "CHI"))
        expectedPicks.add(UserPicksDTO(UserDTO("Sereres")))
        expectedPicks[1].picks.add(PickDTO("SEA@PHI", "PHI"))

        setupMocksForPicks(expectedPicks, setMockResultsForTwoUsersOnePick, week)
        val env = getEnvForWeek(week)

        val results = UserPickDataQueryFetcher(mockConnection).get(env)

        assertEquals(expectedPicks.map { x -> x.user.name }, results.map { x -> x.user.name })
        assertEquals(expectedPicks[0].picks.map { x -> x.game }, results[0].picks.map { x -> x.game })
        assertEquals(expectedPicks[0].picks.map { x -> x.pick }, results[0].picks.map { x -> x.pick })
        assertEquals(expectedPicks[1].picks.map { x -> x.game }, results[1].picks.map { x -> x.game })
        assertEquals(expectedPicks[1].picks.map { x -> x.pick }, results[1].picks.map { x -> x.pick })
    }


    @Test
    fun getReturnsUserPicksWithOneUserAndTwoPicksForWeekWithWeek0() {
        val week = 0
        val expectedPicks: ArrayList<UserPicksDTO> = ArrayList(1)
        expectedPicks.add(UserPicksDTO(UserDTO("Seamus")))
        expectedPicks[0].picks.add(PickDTO("GB@CHI", "CHI"))
        expectedPicks[0].picks.add(PickDTO("SEA@PHI", "PHI"))

        setupMocksForPicks(expectedPicks, setMockResultsForOneUserTwoPicks, week)
        val env = getEnvForWeek(week)

        val results = UserPickDataQueryFetcher(mockConnection).get(env)

        assertEquals(expectedPicks.map { x -> x.user.name }, results.map { x -> x.user.name })
        assertEquals(expectedPicks[0].picks.map { x -> x.game }, results[0].picks.map { x -> x.game })
        assertEquals(expectedPicks[0].picks.map { x -> x.pick }, results[0].picks.map { x -> x.pick })
    }

    private fun getEnvForWeek(week: Int): DataFetchingEnvironment {
        val arguments = HashMap<String, Any>().apply {
            set("week", week)
        }
        val env = setupEnvForArguments(arguments)
        return env
    }

    private fun setupMockForQueryWithWeek(mockResultSet: ResultSet, week: Int) {
        every { mockStatement.executeQuery("SELECT name, game, pick FROM userpicks WHERE week = $week") } returns mockResultSet
    }


    private fun setupMocksForPicks(
        expectedPicks: ArrayList<UserPicksDTO>,
        mockSetter: (ResultSet, ArrayList<UserPicksDTO>) -> MockKAdditionalAnswerScope<String, String>,
        week: Int
    ) {
        val mockResultSet = mockkClass(ResultSet::class)
        every { mockResultSet.next() } returns true andThen false
        mockSetter(mockResultSet, expectedPicks)
        setupMockForQueryWithWeek(mockResultSet, week)
    }

    private fun setupEnvForArguments(arguments: HashMap<String, Any>): DataFetchingEnvironment {
        return DataFetchingEnvironmentImpl
            .newDataFetchingEnvironment()
            .arguments(arguments)
            .build()
    }

    private val setupResultMockForOneUserOnePick = { mockResultSet: ResultSet,
                                                     expectedPicks: ArrayList<UserPicksDTO>
        ->
        every { mockResultSet.getString("name") } returns expectedPicks[0].user.name
        every { mockResultSet.getString("game") } returns expectedPicks[0].picks[0].game
        every { mockResultSet.getString("pick") } returns expectedPicks[0].picks[0].pick
    }

    private var setMockResultsForTwoUsersOnePick = { mockResultSet: ResultSet,
                                                     expectedPicks: ArrayList<UserPicksDTO>
        ->
        every { mockResultSet.next() } returns true andThen true andThen false
        every { mockResultSet.getString("name") } returns expectedPicks[0].user.name andThen expectedPicks[1].user.name
        every { mockResultSet.getString("game") } returns expectedPicks[0].picks[0].game andThen expectedPicks[1].picks[0].game
        every { mockResultSet.getString("pick") } returns expectedPicks[0].picks[0].pick andThen expectedPicks[1].picks[0].pick
    }

    private var setMockResultsForOneUserTwoPicks = { mockResultSet: ResultSet,
                                                     expectedPicks: ArrayList<UserPicksDTO>
        ->
        every { mockResultSet.next() } returns true andThen true andThen false
        every { mockResultSet.getString("name") } returns expectedPicks[0].user.name
        every { mockResultSet.getString("game") } returns expectedPicks[0].picks[0].game andThen expectedPicks[0].picks[1].game
        every { mockResultSet.getString("pick") } returns expectedPicks[0].picks[0].pick andThen expectedPicks[0].picks[1].pick
    }
}


