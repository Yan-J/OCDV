/**
 * 
 * Filename: NYC311Utils.js
 * Last Modified: 05-27-2014
 * Description: Expands sanitation codes to user friendly text 
 * Example Usage: NYC311Utils.expandSanitationCode(sanitationCode);
 * 
 */

var NYC311Utils = NYC311Utils || {};

(function(o) {
	
	/**
	 * 
	 * Default settings. To add exceptions to the searchList, make sure to include 
	 * it at the front of the array and also include the corresponding value in the
	 * replacementList. 'E', '6X', and 'WTF' are the current exceptions to the
	 * standard days of the week values. invalidList is a case insensitive list of 
	 * all values to be interpreted and displayed to the user as the defaultText value.
	 * 
	 */
	o.config = {
			defaultText:'No collection', 
			invalidList:['NONE','EZ','','No pickup','No collection','Private collection'], 
			searchList:['E','6X','WTF','TH','M','T','W','F','S'], 
			replacementList:['Every','Six days a week (not Sunday)','Wednesday, Thursday, Friday','Thursday','Monday','Tuesday','Wednesday','Friday','Saturday']
	};
	
	/**
	 * 
	 * Utility function to replace all occurrences of Strings within another String
	 * 
	 * @param text the text to search and replace in
	 * @param searchList the String array to search for
	 * @param replacementList the String array to replace them with
	 * @return the text with any replacements processed
	 * 
	 */
	o.replaceEach = function(text, searchList, replacementList) {
		// modified version of replaceEach from Apache Commons Lang StringUtils 2.4
		// mchyzer Performance note: This creates very few new objects (one major goal)
		// let me know if there are performance requests, we can create a harness to measure

		if (text == null || text.length == 0 || searchList == null || 
			searchList.length == 0 || replacementList == null || replacementList.length == 0) {
			return text;
		}

		var searchLength = searchList.length;
		var replacementLength = replacementList.length;

		// make sure lengths are ok, these need to be equal
		if (searchLength != replacementLength) {
			console.log('Search and Replace array lengths don\'t match: '
					+ searchLength
					+ ' vs '
					+ replacementLength);
		}

		// keep track of which still have matches
		var noMoreMatchesForReplIndexArray = new Array(searchLength);

		// index on index that the match was found
		var textIndex = -1;
		var replaceIndex = -1;
		var tempIndex = -1;

		// index of replace array that will replace the search string found
		// NOTE: logic duplicated below START
		for (var i = 0; i < searchLength; i++) {
			if (noMoreMatchesForReplIndexArray[i] || searchList[i] == null || 
				searchList[i].length == 0 || replacementList[i] == null) {
				continue;
			}
			tempIndex = text.indexOf(searchList[i]);

			// see if we need to keep searching for this
			if (tempIndex == -1) {
				noMoreMatchesForReplIndexArray[i] = true;
			} else {
				if (textIndex == -1 || tempIndex < textIndex) {
					textIndex = tempIndex;
					replaceIndex = i;
				}
			}
		}
		// NOTE: logic mostly below END

		// no search strings found, we are done
		if (textIndex == -1) {
			return text;
		}

		var start = 0;
		var buf = [];
		
		while (textIndex != -1) {

			for (var i = start; i < textIndex; i++) {
				buf.push(text.charAt(i));
			}
			buf.push(replacementList[replaceIndex]);

			start = textIndex + searchList[replaceIndex].length;

			textIndex = -1;
			replaceIndex = -1;
			tempIndex = -1;
			// find the next earliest match
			// NOTE: logic mostly duplicated above START
			for (var i = 0; i < searchLength; i++) {
				if (noMoreMatchesForReplIndexArray[i] || searchList[i] == null || 
					searchList[i].length == 0 || replacementList[i] == null) {
					continue;
				}
				tempIndex = text.indexOf(searchList[i], start);

				// see if we need to keep searching for this
				if (tempIndex == -1) {
					noMoreMatchesForReplIndexArray[i] = true;
				} else {
					if (textIndex == -1 || tempIndex < textIndex) {
						textIndex = tempIndex;
						replaceIndex = i;
					}
				}
			}
			// NOTE: logic duplicated above END

		}
		var textLength = text.length;
		for (var i = start; i < textLength; i++) {
			buf.push(text.charAt(i));
		}
		
		var result = (buf[0] == o.config.replacementList[0]) ? buf.join(' ') : buf.join(', ');
		
		return result;
	};
	
	/**
	 * 
	 * Utility function to check if the sanitation code is valid
	 * 
	 * @param sanitationCode the String to check
	 * @return true if the sanitation code is valid
	 * 
	 */
	o.isValidSanitationCode = function(sanitationCode) {
		if(typeof sanitationCode !== 'string') {
			return false;
		}
		
		for (var i = 0; i < o.config.invalidList.length; i++) {
			if (o.config.invalidList[i].toUpperCase() == sanitationCode.toUpperCase()) {
				return false;
			}
		}
		
		return true;
	};
	
	/**
	 * 
	 * Utility function to expand the sanitation code to user friendly text
	 * 
	 * @param sanitationCode the sanitation code to expand
	 * @return the expanded sanitation code
	 * 
	 */
	o.expandSanitationCode = function(sanitationCode) {
		try {
			if(o.isValidSanitationCode(sanitationCode)) {
				return o.replaceEach(sanitationCode.toUpperCase(), o.config.searchList, o.config.replacementList);
			} else {
			   // not valid text for replacement or no collection days, use default text
			}
		} catch (e) {
			// unexpected error, use default text
		}
		
		return o.config.defaultText;
	};
	
})(NYC311Utils);

/*
// Unit Test
var testObj = {a:'ETH',b:'WS',c:''}
var testCases = ['MWF',
                 'EM',
                 'TTH',
                 'MTWTHFS',
                 'SMTHTW',
                 'mwf',
                 'mWf',
                 'ABCDEFG',
                 'abcdefg',
                 'NONE',
                 'EZ',
                 '',
                 'No pickup',
                 'No collection',
                 'Private collection',
                 '6X',
                 'MWTFS',
                 'MTWFS',
                 null,
                 testObj,
                 testObj.a,
                 testObj.b,
                 testObj.c,
                 testObj.d];
for (var i = 0; i < testCases.length; i++) {
	console.log('test ' + i + ': ' + testCases[i] + ' = ' + NYC311Utils.expandSanitationCode(testCases[i]));
}

/*
test 0: MWF = Monday, Wednesday, Friday
test 1: EM = Every Monday
test 2: TTH = Tuesday, Thursday
test 3: MTWTHFS = Monday, Tuesday, Wednesday, Thursday, Friday, Saturday
test 4: SMTHTW = Saturday, Monday, Thursday, Tuesday, Wednesday
test 5: mwf = Monday, Wednesday, Friday
test 6: mWf = Monday, Wednesday, Friday
test 7: ABCDEFG = A, B, C, D, Every, Friday, G
test 8: abcdefg = A, B, C, D, Every, Friday, G
test 9: NONE = No collection
test 10: EZ = No collection
test 11:  = No collection
test 12: No pickup = No collection
test 13: No collection = No collection
test 14: Private collection = No collection
test 15: 6X = Six days a week (not Sunday)
test 16: MWTFS = Monday, Wednesday, Thursday, Friday, Saturday
test 17: MTWFS = Monday, Tuesday, Wednesday, Friday, Saturday
test 18: null = No collection
test 19: [object Object] = No collection
test 20: ETH = Every Thursday
test 21: WS = Wednesday, Saturday
test 22:  = No collection
test 23: undefined = No collection
*/