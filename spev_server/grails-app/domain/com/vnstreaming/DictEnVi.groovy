package com.vnstreaming

class DictEnVi {
	String word;
	String phonetic;
	String meanings;
    static constraints = {
		word blank:false
		meanings blank:false
		phonetic blank:false 
    }
}
