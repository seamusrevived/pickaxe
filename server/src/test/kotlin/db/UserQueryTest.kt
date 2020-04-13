@file:Suppress("SqlResolve")

package db

import dto.UserDTO
import graphql.schema.DataFetchingEnvironment
import graphql.schema.DataFetchingEnvironmentImpl
import io.mockk.every
import io.mockk.mockkClass
import io.mockk.mockkStatic
import mockNextReturnTimes
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.sql.Connection
import java.sql.DriverManager
import java.sql.ResultSet
import java.sql.Statement

class UserQueryTest {
    private lateinit var mockStatement: Statement
    private lateinit var mockConnection: Connection
    private lateinit var env: DataFetchingEnvironment

    @BeforeEach
    fun beforeEach() {
        mockkStatic("java.sql.DriverManager")
        mockConnection = mockkClass(Connection::class)
        mockStatement = mockkClass(Statement::class)

        every { DriverManager.getConnection(any()) } returns null
        every { DriverManager.getConnection(any(), any()) } returns mockConnection
        every { mockConnection.createStatement() } returns mockStatement

        env = DataFetchingEnvironmentImpl.newDataFetchingEnvironment().build()
    }

    @Test
    fun getReturnsActiveUsersFromDatabaseWhenSingleUser() {
        val expectedUsers: ArrayList<UserDTO> = ArrayList(1)
        expectedUsers.add(UserDTO("Seamus"))
        val mockResultSet = mockkClass(ResultSet::class)

        mockNextReturnTimes(mockResultSet, 1)

        every {
            mockResultSet.getString("name")
        } returns expectedUsers[0].name

        every { mockStatement.executeQuery("SELECT name FROM users WHERE active = TRUE") } returns mockResultSet


        val results = UserQuery(mockConnection).get(env)

        assertEquals(expectedUsers.map { x -> x.name }, results.map { x -> x.name })
    }

    @Test
    fun getReturnsActiveUsersFromDatabaseWhenTwoUsers() {
        val expectedUsers: ArrayList<UserDTO> = ArrayList(2)
        expectedUsers.add(UserDTO("Stebe"))
        expectedUsers.add(UserDTO("Dave"))
        val mockResultSet = mockkClass(ResultSet::class)

        mockNextReturnTimes(mockResultSet, 2)

        every {
            mockResultSet.getString("name")
        } returnsMany expectedUsers.map { user -> user.name }

        every { mockStatement.executeQuery("SELECT name FROM users WHERE active = TRUE") } returns mockResultSet


        val results = UserQuery(mockConnection).get(env)

        assertEquals(expectedUsers.map { x -> x.name }, results.map { x -> x.name })
    }
}