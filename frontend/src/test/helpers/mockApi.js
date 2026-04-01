import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

/**
 * Create a mock axios instance with helper methods
 * @returns {Object} Mock adapter with helper methods
 */
export const createMockApi = () => {
  const mock = new MockAdapter(axios)

  const helpers = {
    /**
     * Mock successful GET request
     * @param {string} url - URL to mock
     * @param {Object} data - Response data
     * @param {number} status - HTTP status code
     */
    mockGet: (url, data, status = 200) => {
      mock.onGet(url).reply(status, data)
    },

    /**
     * Mock failed GET request
     * @param {string} url - URL to mock
     * @param {string|Object} error - Error message or object
     * @param {number} status - HTTP status code
     */
    mockGetError: (url, error, status = 400) => {
      mock.onGet(url).reply(status, { error })
    },

    /**
     * Mock successful POST request
     * @param {string} url - URL to mock
     * @param {Object} data - Request data
     * @param {Object} response - Response data
     * @param {number} status - HTTP status code
     */
    mockPost: (url, data, response, status = 200) => {
      mock.onPost(url, data).reply(status, response)
    },

    /**
     * Mock any POST request (for flexible data matching)
     * @param {string} url - URL to mock
     * @param {Object} response - Response data
     * @param {number} status - HTTP status code
     */
    mockPostAny: (url, response, status = 200) => {
      mock.onPost(url).reply(status, response)
    },

    /**
     * Mock failed POST request
     * * @param {string} url - URL to mock
     * @param {Object} data - Request data
     * @param {string|Object} error - Error message or object
     * @param {number} status - HTTP status code
     */
    mockPostError: (url, data, error, status = 400) => {
      mock.onPost(url, data).reply(status, { error })
    },

    /**
     * Mock successful PUT request
     * @param {string} url - URL to mock
     * @param {Object} data - Request data
     * @param {Object} response - Response data
     * @param {number} status - HTTP status code
     */
    mockPut: (url, data, response, status = 200) => {
      mock.onPut(url, data).reply(status, response)
    },

    /**
     * Mock failed PUT request
     * @param {string} url - URL to mock
     * @param {Object} data - Request data
     * @param {string|Object} error - Error message or object
     * @param {number} status - HTTP status code
     */
    mockPutError: (url, data, error, status = 400) => {
      mock.onPut(url, data).reply(status, { error })
    },

    /**
     * Mock successful DELETE request
     * @param {string} url - URL to mock
     * @param {Object} response - Response data
     * @param {number} status - HTTP status code
     */
    mockDelete: (url, response = {}, status = 200) => {
      mock.onDelete(url).reply(status, response)
    },

    /**
     * Mock failed DELETE request
     * @param {string} url - URL to mock
     * @param {string|Object} error - Error message or object
     * @param {number} status - HTTP status code
     */
    mockDeleteError: (url, error, status = 400) => {
      mock.onDelete(url).reply(status, { error })
    },

    /**
     * Reset all mocks
     */
    reset: () => {
      mock.reset()
    },

    /**
     * Restore original axios
     */
    restore: () => {
      mock.restore()
    }
  }

  return helpers
}
// test change
