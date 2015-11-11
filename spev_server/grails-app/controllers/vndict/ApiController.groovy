package vndict

import java.lang.reflect.Array;

import com.vnstreaming.DictEnVi

import grails.converters.JSON
import grails.util.Holders;

class ApiController {

    def index() { 
		def lW = DictEnVi.list();
		for (def w in lW){
			String[] p = w.meanings.split("\n")
			if(p.length == 1)
			print p
			List<String> n = Arrays.asList(p);
			//n.removeAll { it.toLowerCase().startsWith('=') }
			//print n
		}
	}
	
	def searchEV(){
		def word = params.word;
		if(word){
			def fWord = DictEnVi.findByWord(word)
			if(fWord){
				render(status:200, contentType: "text/json") {
				    result(phonetic: fWord.phonetic, meanings: fWord.meanings)
				}
				return
			}
		}
		render (status:200,"Word not found")
	}
}
